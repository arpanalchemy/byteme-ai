import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  HttpClient,
  ThorClient,
  VeChainPrivateKeySigner,
  VeChainProvider,
} from "@vechain/sdk-network";
import { secp256k1 } from "thor-devkit";
import * as bip39 from "bip39";
import * as hdkey from "hdkey";

// EVDriveV2 Contract ABI (embedded)
const EVDRIVEV2_ABI = [
  {
    inputs: [],
    name: "getCurrentCycle",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_cycleId", type: "uint256" }],
    name: "getCycleInfo",
    outputs: [
      { internalType: "uint256", name: "allocation", type: "uint256" },
      { internalType: "uint256", name: "distributed", type: "uint256" },
      { internalType: "uint256", name: "remaining", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAvailableFunds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserData",
    outputs: [
      { internalType: "uint256", name: "lastMiles", type: "uint256" },
      { internalType: "uint256", name: "lastSubmissionDate", type: "uint256" },
      { internalType: "uint256", name: "carbonFootprint", type: "uint256" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGlobalStats",
    outputs: [
      { internalType: "uint256", name: "_totalCarbon", type: "uint256" },
      { internalType: "uint256", name: "_totalMilesDriven", type: "uint256" },
      { internalType: "uint256", name: "_usersJoined", type: "uint256" },
      {
        internalType: "uint256",
        name: "_totalRewardDistributed",
        type: "uint256",
      },
      { internalType: "uint256", name: "_currentCycle", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_rewardAmount", type: "uint256" },
    ],
    name: "setRewardForCycle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "uint256", name: "miles", type: "uint256" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "string[]", name: "proofTypes", type: "string[]" },
          { internalType: "string[]", name: "proofValues", type: "string[]" },
          { internalType: "string[]", name: "impactCodes", type: "string[]" },
          {
            internalType: "uint256[]",
            name: "impactValues",
            type: "uint256[]",
          },
          { internalType: "string", name: "description", type: "string" },
        ],
        internalType: "struct EVDriveV2.BatchRewardInput[]",
        name: "batch",
        type: "tuple[]",
      },
    ],
    name: "distributeRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

@Injectable()
export class VeChainService {
  private readonly logger = new Logger(VeChainService.name);
  private thor: ThorClient;
  private evDriveContract: any;
  private privateKey: Buffer;
  private contractAddress: string;
  private mnemonic: string;
  private nodeUrl: string;
  private network: "mainnet" | "testnet";

  constructor(private configService: ConfigService) {
    this.initializeVeChain();
  }

  /**
   * Convert mnemonic to private key using BIP39 and HD wallet derivation
   */
  private mnemonicToPrivateKey(
    mnemonic: string,
    derivationPath: string = "m/44'/818'/0'/0/0",
  ): Buffer {
    try {
      // Validate mnemonic
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error("Invalid mnemonic phrase");
      }

      // Generate seed from mnemonic
      const seed = bip39.mnemonicToSeedSync(mnemonic);

      // Create HD wallet
      const hdWallet = hdkey.fromMasterSeed(seed);

      // Derive private key from path
      const childKey = hdWallet.derive(derivationPath);

      return childKey.privateKey;
    } catch (error) {
      this.logger.error("Failed to convert mnemonic to private key:", error);
      throw error;
    }
  }

  private initializeVeChain() {
    try {
      // Initialize configuration
      this.nodeUrl =
        this.configService.get<string>("VECHAIN_NODE_URL") ||
        "https://testnet.veblocks.net";

      this.network =
        (this.configService.get<string>("VECHAIN_NETWORK") as
          | "mainnet"
          | "testnet") || "testnet";

      // Initialize ThorClient
      // TODO: Fix HttpClient import issue - need to check correct VeChain SDK v2.0.2 usage
      this.thor = new ThorClient(this.nodeUrl as any, {
        isPollingEnabled: false,
      });

      // Initialize admin wallet using mnemonic
      this.mnemonic = this.configService.get<string>("VECHAIN_MNEMONIC");
      if (!this.mnemonic) {
        this.logger.warn(
          "VECHAIN_MNEMONIC not provided - blockchain features will be disabled",
        );
        return;
      }

      // Convert mnemonic to private key
      this.privateKey = this.mnemonicToPrivateKey(this.mnemonic);

      this.contractAddress = this.configService.get<string>(
        "VECHAIN_CONTRACT_ADDRESS",
      );

      if (!this.contractAddress) {
        this.logger.warn(
          "VECHAIN_CONTRACT_ADDRESS not provided - blockchain features will be disabled",
        );
        return;
      }

      // Load the EVDriveV2 contract
      this.evDriveContract = this.thor.contracts.load(
        this.contractAddress,
        EVDRIVEV2_ABI,
        new VeChainPrivateKeySigner(
          this.privateKey,
          new VeChainProvider(this.thor),
        ),
      );

      this.logger.log(
        `VeChain service initialized successfully on ${this.network}`,
      );
      this.logger.log(`Admin address: ${this.getAdminAddress()}`);
      this.logger.log(`EVDriveV2 Contract: ${this.contractAddress}`);
      this.logger.log(`Node URL: ${this.nodeUrl}`);
    } catch (error) {
      console.log("🚀 ~ VeChainService ~ initializeVeChain ~ error:", error);
      this.logger.error("Failed to initialize VeChain service:", error);
      this.logger.warn("Blockchain features will be disabled");
    }
  }

  /**
   * Get current cycle information from EVDriveV2 contract
   */
  async getCurrentCycle(): Promise<number> {
    try {
      if (!this.evDriveContract) {
        throw new Error("VeChain service not initialized");
      }

      const result = await this.evDriveContract.read.getCurrentCycle();
      this.logger.log(`Current cycle from EVDriveV2: ${result}`);
      return parseInt(result.toString());
    } catch (error) {
      this.logger.error("Failed to get current cycle:", error);
      throw error;
    }
  }

  /**
   * Get cycle information from EVDriveV2 contract
   */
  async getCycleInfo(cycleId: number): Promise<{
    allocation: number;
    distributed: number;
    remaining: number;
  }> {
    try {
      if (!this.evDriveContract) {
        throw new Error("VeChain service not initialized");
      }

      const result = await this.evDriveContract.read.getCycleInfo(cycleId);
      this.logger.log(
        `Cycle info from EVDriveV2 for cycle ${cycleId}:`,
        result,
      );

      return {
        allocation: parseInt(result[0].toString()),
        distributed: parseInt(result[1].toString()),
        remaining: parseInt(result[2].toString()),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get cycle info for cycle ${cycleId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get available funds in rewards pool from EVDriveV2 contract
   */
  async getAvailableFunds(): Promise<number> {
    try {
      if (!this.evDriveContract) {
        throw new Error("VeChain service not initialized");
      }

      const result = await this.evDriveContract.read.getAvailableFunds();
      this.logger.log(`Available funds from EVDriveV2: ${result}`);
      return parseInt(result.toString());
    } catch (error) {
      this.logger.error("Failed to get available funds:", error);
      throw error;
    }
  }

  /**
   * Get user data from EVDriveV2 contract
   */
  async getUserData(userAddress: string): Promise<{
    lastMiles: number;
    lastSubmissionDate: number;
    carbonFootprint: number;
    exists: boolean;
  }> {
    try {
      if (!this.evDriveContract) {
        throw new Error("VeChain service not initialized");
      }

      const result = await this.evDriveContract.read.getUserData(userAddress);
      this.logger.log(`User data from EVDriveV2 for ${userAddress}:`, result);

      return {
        lastMiles: parseInt(result[0].toString()),
        lastSubmissionDate: parseInt(result[1].toString()),
        carbonFootprint: parseInt(result[2].toString()),
        exists: result[3],
      };
    } catch (error) {
      this.logger.error(`Failed to get user data for ${userAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get global stats from EVDriveV2 contract
   */
  async getGlobalStats(): Promise<{
    totalCarbon: number;
    totalMilesDriven: number;
    usersJoined: number;
    totalRewardDistributed: number;
    currentCycle: number;
  }> {
    try {
      if (!this.evDriveContract) {
        throw new Error("VeChain service not initialized");
      }

      const result = await this.evDriveContract.read.getGlobalStats();
      this.logger.log(`Global stats from EVDriveV2:`, result);

      return {
        totalCarbon: parseInt(result[0].toString()),
        totalMilesDriven: parseInt(result[1].toString()),
        usersJoined: parseInt(result[2].toString()),
        totalRewardDistributed: parseInt(result[3].toString()),
        currentCycle: parseInt(result[4].toString()),
      };
    } catch (error) {
      this.logger.error("Failed to get global stats:", error);
      throw error;
    }
  }

  /**
   * Set reward for cycle using EVDriveV2 contract
   */
  async setRewardForCycle(rewardAmount: number): Promise<string> {
    try {
      if (!this.evDriveContract) {
        throw new Error("VeChain service not initialized");
      }

      this.logger.log(
        `Setting reward for cycle: ${rewardAmount} via EVDriveV2 contract`,
      );

      const result =
        await this.evDriveContract.write.setRewardForCycle(rewardAmount);

      this.logger.log(`📝 Contract: ${this.contractAddress}`);
      this.logger.log(`🔑 Admin Address: ${this.getAdminAddress()}`);
      this.logger.log(`🌐 Network: ${this.network}`);

      if (result.txid) {
        this.logger.log(
          `✅ Transaction submitted successfully: ${result.txid}`,
        );
        return result.txid;
      } else {
        throw new Error("Failed to get transaction ID from result");
      }
    } catch (error) {
      this.logger.error(
        `Failed to set reward for cycle ${rewardAmount}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Distribute rewards in batch using EVDriveV2 contract
   */
  async distributeRewards(
    batchData: Array<{
      user: string;
      miles: number;
      amount: number;
      proofTypes: string[];
      proofValues: string[];
      impactCodes: string[];
      impactValues: number[];
      description: string;
    }>,
  ): Promise<string> {
    try {
      if (!this.evDriveContract) {
        throw new Error("VeChain service not initialized");
      }

      this.logger.log(
        `🚀 Distributing rewards to ${batchData.length} users via EVDriveV2 contract...`,
      );

      // Log the batch data for debugging
      batchData.forEach((data, index) => {
        this.logger.log(
          `📦 Batch ${index + 1}: User ${data.user}, Amount ${data.amount} B3TR, Miles ${data.miles}`,
        );
      });

      // Prepare batch data for EVDriveV2.distributeRewards()
      const batchInput = batchData.map((data) => ({
        user: data.user,
        miles: Math.floor(data.miles * 100) / 100, // Round to 2 decimal places
        amount: Math.floor(data.amount * 100000000) / 100000000, // Round to 8 decimal places
        proofTypes: data.proofTypes,
        proofValues: data.proofValues,
        impactCodes: data.impactCodes,
        impactValues: data.impactValues.map((v) => Math.floor(v * 100) / 100), // Round to 2 decimal places
        description: data.description,
      }));

      const result =
        await this.evDriveContract.write.distributeRewards(batchInput);

      this.logger.log(`📝 Contract: ${this.contractAddress}`);
      this.logger.log(`🌐 Network: ${this.network}`);
      this.logger.log(`🔑 Admin Address: ${this.getAdminAddress()}`);
      this.logger.log(`📊 Batch Size: ${batchData.length} users`);

      if (result.txid) {
        this.logger.log(
          `✅ Transaction submitted successfully: ${result.txid}`,
        );
        return result.txid;
      } else {
        throw new Error("Failed to get transaction ID from result");
      }
    } catch (error) {
      this.logger.error("Failed to distribute rewards:", error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txid: string): Promise<any> {
    try {
      if (!this.thor) {
        throw new Error("VeChain service not initialized");
      }

      // Mock implementation for now
      this.logger.log(
        `Getting transaction receipt for ${txid} (mock implementation)`,
      );
      return {
        txid,
        reverted: false,
        gasUsed: 100000,
        blockNumber: 12345,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get transaction receipt for ${txid}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if transaction is confirmed
   */
  async isTransactionConfirmed(txid: string): Promise<boolean> {
    try {
      if (!this.thor) {
        return false;
      }

      // Mock implementation for now
      this.logger.log(
        `Checking transaction confirmation for ${txid} (mock implementation)`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to check transaction confirmation for ${txid}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Get admin wallet address
   */
  getAdminAddress(): string {
    if (!this.privateKey) {
      return "";
    }
    const publicKey = secp256k1.derivePublicKey(this.privateKey);
    const { keccak256 } = require("thor-devkit");
    const hash = keccak256(publicKey.slice(1));
    return "0x" + hash.slice(-20).toString("hex");
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return this.contractAddress || "";
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return !!(this.thor && this.evDriveContract && this.privateKey);
  }

  /**
   * Transfer tokens (mock implementation)
   */
  async transferTokens(
    fromAddress: string,
    toAddress: string,
    amount: number,
  ): Promise<any> {
    try {
      this.logger.log(
        `Transferring ${amount} tokens from ${fromAddress} to ${toAddress} (mock)`,
      );
      return {
        txid: "0x" + Math.random().toString(16).slice(2, 66),
        success: true,
      };
    } catch (error) {
      this.logger.error("Failed to transfer tokens:", error);
      throw error;
    }
  }

  /**
   * Get balance (mock implementation)
   */
  async getBalance(walletAddress: string): Promise<number> {
    return 1000; // Mock balance
  }

  /**
   * Get B3TR balance (mock implementation)
   */
  async getB3TRBalance(walletAddress: string): Promise<number> {
    return 500; // Mock B3TR balance
  }

  /**
   * Get block height (mock implementation)
   */
  async getBlockHeight(): Promise<number> {
    return 12345; // Mock block height
  }

  /**
   * Get last block time (mock implementation)
   */
  async getLastBlockTime(): Promise<Date> {
    return new Date(); // Mock block time
  }

  /**
   * Get average block time (mock implementation)
   */
  async getAverageBlockTime(): Promise<number> {
    return 10; // Mock average block time in seconds
  }

  /**
   * Get active validators (mock implementation)
   */
  async getActiveValidators(): Promise<number> {
    return 101; // Mock validator count
  }

  /**
   * Get total staked (mock implementation)
   */
  async getTotalStaked(): Promise<number> {
    return 1000000; // Mock total staked amount
  }

  /**
   * Get network load (mock implementation)
   */
  async getNetworkLoad(): Promise<number> {
    return 75; // Mock network load percentage
  }

  /**
   * Get gas price (mock implementation)
   */
  async getGasPrice(): Promise<{
    slow: number;
    standard: number;
    fast: number;
  }> {
    return {
      slow: 1000000000,
      standard: 2000000000,
      fast: 3000000000,
    };
  }
}

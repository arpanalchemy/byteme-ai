import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { secp256k1 } from "thor-devkit";

// Simple wallet implementation using secp256k1
class Wallet {
  public address: string;
  private privateKey: Buffer;

  constructor(privateKey: Buffer) {
    this.privateKey = privateKey;
    const publicKey = secp256k1.derivePublicKey(privateKey);
    this.address = this.publicKeyToAddress(publicKey);
  }

  private publicKeyToAddress(publicKey: Buffer): string {
    const { keccak256 } = require("thor-devkit");
    const hash = keccak256(publicKey.slice(1));
    return "0x" + hash.slice(-20).toString("hex");
  }

  sign(transaction: any): any {
    const { keccak256 } = require("thor-devkit");
    const messageHash = keccak256(JSON.stringify(transaction));
    const signature = secp256k1.sign(messageHash, this.privateKey);
    return {
      ...transaction,
      signature: signature,
    };
  }
}

@Injectable()
export class VeChainService {
  private readonly logger = new Logger(VeChainService.name);
  private wallet: Wallet;
  private contractAddress: string;
  private adminPrivateKey: string;
  private nodeUrl: string;

  constructor(private configService: ConfigService) {
    this.initializeVeChain();
  }

  private initializeVeChain() {
    try {
      // Initialize configuration
      this.nodeUrl =
        this.configService.get<string>("VECHAIN_NODE_URL") ||
        "https://testnet.veblocks.net";

      // Initialize admin wallet
      this.adminPrivateKey = this.configService.get<string>(
        "VECHAIN_ADMIN_PRIVATE_KEY"
      );
      if (!this.adminPrivateKey) {
        this.logger.warn(
          "VECHAIN_ADMIN_PRIVATE_KEY not provided - blockchain features will be disabled"
        );
        return;
      }

      this.wallet = new Wallet(
        Buffer.from(this.adminPrivateKey.slice(2), "hex")
      );
      this.contractAddress = this.configService.get<string>(
        "VECHAIN_CONTRACT_ADDRESS"
      );

      this.logger.log("VeChain service initialized successfully");
      this.logger.log(`Admin address: ${this.wallet.address}`);
      this.logger.log(`Contract address: ${this.contractAddress}`);
      this.logger.log(`Node URL: ${this.nodeUrl}`);
    } catch (error) {
      console.log("🚀 ~ VeChainService ~ initializeVeChain ~ error:", error);
      this.logger.error("Failed to initialize VeChain service:", error);
      this.logger.warn("Blockchain features will be disabled");
    }
  }

  /**
   * Get current cycle information from contract
   */
  async getCurrentCycle(): Promise<number> {
    try {
      if (!this.wallet) {
        throw new Error("VeChain service not initialized");
      }

      // Mock implementation for now
      this.logger.log("Getting current cycle (mock implementation)");
      return 1;
    } catch (error) {
      this.logger.error("Failed to get current cycle:", error);
      throw error;
    }
  }

  /**
   * Get cycle information
   */
  async getCycleInfo(cycleId: number): Promise<{
    allocation: number;
    distributed: number;
    remaining: number;
  }> {
    try {
      if (!this.wallet) {
        throw new Error("VeChain service not initialized");
      }

      // Mock implementation for now
      this.logger.log(
        `Getting cycle info for cycle ${cycleId} (mock implementation)`
      );
      return {
        allocation: 1000000, // 1M B3TR
        distributed: 500000, // 500K B3TR
        remaining: 500000, // 500K B3TR
      };
    } catch (error) {
      this.logger.error(
        `Failed to get cycle info for cycle ${cycleId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get available funds in rewards pool
   */
  async getAvailableFunds(): Promise<number> {
    try {
      if (!this.wallet) {
        throw new Error("VeChain service not initialized");
      }

      // Mock implementation for now
      this.logger.log("Getting available funds (mock implementation)");
      return 1000000; // 1M B3TR
    } catch (error) {
      this.logger.error("Failed to get available funds:", error);
      throw error;
    }
  }

  /**
   * Get user data from contract
   */
  async getUserData(userAddress: string): Promise<{
    lastMiles: number;
    lastSubmissionDate: number;
    carbonFootprint: number;
    exists: boolean;
  }> {
    try {
      if (!this.wallet) {
        throw new Error("VeChain service not initialized");
      }

      // Mock implementation for now
      this.logger.log(
        `Getting user data for ${userAddress} (mock implementation)`
      );
      return {
        lastMiles: 150.5,
        lastSubmissionDate: Math.floor(Date.now() / 1000),
        carbonFootprint: 15050, // 15.05 kg CO2
        exists: true,
      };
    } catch (error) {
      this.logger.error(`Failed to get user data for ${userAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get global stats from contract
   */
  async getGlobalStats(): Promise<{
    totalCarbon: number;
    totalMilesDriven: number;
    usersJoined: number;
    totalRewardDistributed: number;
    currentCycle: number;
  }> {
    try {
      if (!this.wallet) {
        throw new Error("VeChain service not initialized");
      }

      // Mock implementation for now
      this.logger.log("Getting global stats (mock implementation)");
      return {
        totalCarbon: 5000000, // 5M grams = 5 tons CO2
        totalMilesDriven: 50000, // 50K miles
        usersJoined: 1000,
        totalRewardDistributed: 100000, // 100K B3TR
        currentCycle: 1,
      };
    } catch (error) {
      this.logger.error("Failed to get global stats:", error);
      throw error;
    }
  }

  /**
   * Set reward allocation for a new cycle
   */
  async setRewardForCycle(rewardAmount: number): Promise<string> {
    try {
      if (!this.wallet) {
        throw new Error("VeChain service not initialized");
      }

      // Mock implementation for now
      this.logger.log(
        `Setting reward for cycle: ${rewardAmount} (mock implementation)`
      );
      const mockTxHash = "0x" + Math.random().toString(16).slice(2, 66);
      return mockTxHash;
    } catch (error) {
      this.logger.error(
        `Failed to set reward for cycle ${rewardAmount}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Distribute rewards in batch
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
    }>
  ): Promise<string> {
    try {
      if (!this.wallet) {
        throw new Error("VeChain service not initialized");
      }

      // Mock implementation for now
      this.logger.log(
        `Distributing rewards to ${batchData.length} users (mock implementation)`
      );

      // Log the batch data for debugging
      batchData.forEach((data, index) => {
        this.logger.log(
          `Batch ${index + 1}: User ${data.user}, Amount ${data.amount} B3TR, Miles ${data.miles}`
        );
      });

      const mockTxHash = "0x" + Math.random().toString(16).slice(2, 66);
      this.logger.log(`Mock transaction hash: ${mockTxHash}`);
      return mockTxHash;
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
      if (!this.wallet) {
        throw new Error("VeChain service not initialized");
      }

      // Mock implementation for now
      this.logger.log(
        `Getting transaction receipt for ${txid} (mock implementation)`
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
        error
      );
      throw error;
    }
  }

  /**
   * Check if transaction is confirmed
   */
  async isTransactionConfirmed(txid: string): Promise<boolean> {
    try {
      if (!this.wallet) {
        return false;
      }

      const receipt = await this.getTransactionReceipt(txid);
      return receipt && receipt.reverted === false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get admin wallet address
   */
  getAdminAddress(): string {
    return this.wallet?.address || "0x0000000000000000000000000000000000000000";
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return this.contractAddress || "0x0000000000000000000000000000000000000000";
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return !!this.wallet;
  }
}

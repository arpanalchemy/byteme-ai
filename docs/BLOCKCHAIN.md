# VeChain Blockchain Integration Guide

## Overview

The EV Odometer Rewards system integrates with the VeChain blockchain for secure and transparent reward distribution. This guide covers the complete blockchain integration, from smart contract development to wallet connectivity and transaction management.

## VeChain Network

### Network Configuration

**Mainnet:**

- **Network ID**: 1
- **RPC URL**: `https://mainnet.veblocks.net`
- **Explorer**: `https://explore.vechain.org`
- **Token Symbol**: B3TR
- **Contract Address**: `0x1234567890abcdef...`

**Testnet:**

- **Network ID**: 39
- **RPC URL**: `https://testnet.veblocks.net`
- **Explorer**: `https://explore-testnet.vechain.org`
- **Token Symbol**: B3TR-TEST
- **Contract Address**: `0xabcdef1234567890...`

### Environment Configuration

```typescript
// blockchain.config.ts
export const blockchainConfig = {
  network: process.env.VECHAIN_NETWORK || "testnet",
  rpcUrl: process.env.VECHAIN_RPC_URL || "https://testnet.veblocks.net",
  contractAddress: process.env.VECHAIN_CONTRACT_ADDRESS,
  privateKey: process.env.VECHAIN_PRIVATE_KEY,
  gasLimit: 500000,
  gasPrice: "1000000000", // 1 VTHO
  chainTag: process.env.VECHAIN_NETWORK === "mainnet" ? 0x4a : 0x27,
};
```

## Smart Contracts

### B3TR Token Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract B3TRToken is ERC20, Ownable, Pausable {
    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public blacklisted;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event Blacklisted(address indexed account);
    event Unblacklisted(address indexed account);

    constructor() ERC20("B3TR Token", "B3TR") {
        _mint(msg.sender, 1000000 * 10**decimals()); // 1M initial supply
    }

    modifier onlyMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier notBlacklisted(address account) {
        require(!blacklisted[account], "Account is blacklisted");
        _;
    }

    function addMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }

    function mint(address to, uint256 amount) external onlyMinter notBlacklisted(to) {
        require(to != address(0), "Cannot mint to zero address");
        _mint(to, amount);
    }

    function blacklist(address account) external onlyOwner {
        blacklisted[account] = true;
        emit Blacklisted(account);
    }

    function unblacklist(address account) external onlyOwner {
        blacklisted[account] = false;
        emit Unblacklisted(account);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        require(!blacklisted[from], "Sender is blacklisted");
        require(!blacklisted[to], "Recipient is blacklisted");
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

### Reward Distribution Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./B3TRToken.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardDistributor is ReentrancyGuard, Ownable {
    B3TRToken public token;

    mapping(address => uint256) public userRewards;
    mapping(bytes32 => bool) public processedUploads;

    uint256 public constant REWARD_PER_10KM = 1 * 10**18; // 1 B3TR per 10km
    uint256 public constant MIN_MILEAGE = 1; // Minimum 1km
    uint256 public constant MAX_MILEAGE = 1000; // Maximum 1000km per upload

    event RewardDistributed(
        address indexed user,
        uint256 amount,
        uint256 mileage,
        bytes32 uploadId
    );

    event RewardWithdrawn(
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _token) {
        token = B3TRToken(_token);
    }

    function distributeReward(
        address user,
        uint256 mileage,
        bytes32 uploadId
    ) external onlyOwner nonReentrant {
        require(user != address(0), "Invalid user address");
        require(mileage >= MIN_MILEAGE, "Mileage too low");
        require(mileage <= MAX_MILEAGE, "Mileage too high");
        require(!processedUploads[uploadId], "Upload already processed");

        uint256 reward = calculateReward(mileage);
        require(reward > 0, "No reward to distribute");

        processedUploads[uploadId] = true;
        userRewards[user] += reward;

        // Mint tokens to user
        token.mint(user, reward);

        emit RewardDistributed(user, reward, mileage, uploadId);
    }

    function withdrawRewards() external nonReentrant {
        uint256 amount = userRewards[msg.sender];
        require(amount > 0, "No rewards to withdraw");

        userRewards[msg.sender] = 0;

        // Transfer tokens to user
        require(token.transfer(msg.sender, amount), "Transfer failed");

        emit RewardWithdrawn(msg.sender, amount, block.timestamp);
    }

    function calculateReward(uint256 mileage) public pure returns (uint256) {
        return (mileage / 10) * REWARD_PER_10KM;
    }

    function getPendingRewards(address user) external view returns (uint256) {
        return userRewards[user];
    }

    function isUploadProcessed(bytes32 uploadId) external view returns (bool) {
        return processedUploads[uploadId];
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.transfer(owner(), balance);
        }
    }

    function updateTokenAddress(address newToken) external onlyOwner {
        require(newToken != address(0), "Invalid token address");
        token = B3TRToken(newToken);
    }
}
```

## Backend Integration

### Blockchain Service

```typescript
// blockchain.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Connex, Framework } from "vechain";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private connex: Connex;
  private rewardContract: any;
  private tokenContract: any;

  constructor(private configService: ConfigService) {
    this.initializeConnex();
  }

  private initializeConnex() {
    const network = this.configService.get("VECHAIN_NETWORK");
    const rpcUrl = this.configService.get("VECHAIN_RPC_URL");

    this.connex = new Framework.Connex({
      node: rpcUrl,
      network: network === "mainnet" ? "main" : "test",
    });

    const rewardAddress = this.configService.get("VECHAIN_CONTRACT_ADDRESS");
    const tokenAddress = this.configService.get("VECHAIN_TOKEN_ADDRESS");

    this.rewardContract = this.connex.thor.account(rewardAddress);
    this.tokenContract = this.connex.thor.account(tokenAddress);
  }

  async distributeReward(
    userAddress: string,
    mileage: number,
    uploadId: string
  ): Promise<string> {
    try {
      const uploadHash = this.connex.utils.keccak256(uploadId);
      const reward = this.calculateReward(mileage);

      const clause = this.rewardContract.method({
        name: "distributeReward",
        args: [userAddress, mileage, uploadHash],
      });

      const result = await this.connex.thor
        .account(this.configService.get("VECHAIN_PRIVATE_KEY"))
        .signer()
        .signer()
        .sign([clause]);

      this.logger.log(`Reward distributed: ${result.txid}`);
      return result.txid;
    } catch (error) {
      this.logger.error("Failed to distribute reward", error);
      throw new Error("Blockchain transaction failed");
    }
  }

  async getTransactionStatus(txId: string): Promise<any> {
    try {
      const receipt = await this.connex.thor.transaction(txId).getReceipt();
      return {
        txId,
        status: receipt ? "confirmed" : "pending",
        blockNumber: receipt?.meta?.blockNumber,
        gasUsed: receipt?.meta?.gasUsed,
        timestamp: receipt?.meta?.blockTimestamp,
      };
    } catch (error) {
      this.logger.error("Failed to get transaction status", error);
      throw new Error("Failed to get transaction status");
    }
  }

  async getUserBalance(userAddress: string): Promise<number> {
    try {
      const balance = await this.tokenContract
        .method({
          name: "balanceOf",
          args: [userAddress],
        })
        .call();

      return parseFloat(balance.decoded[0]) / Math.pow(10, 18);
    } catch (error) {
      this.logger.error("Failed to get user balance", error);
      throw new Error("Failed to get user balance");
    }
  }

  async getPendingRewards(userAddress: string): Promise<number> {
    try {
      const pending = await this.rewardContract
        .method({
          name: "getPendingRewards",
          args: [userAddress],
        })
        .call();

      return parseFloat(pending.decoded[0]) / Math.pow(10, 18);
    } catch (error) {
      this.logger.error("Failed to get pending rewards", error);
      throw new Error("Failed to get pending rewards");
    }
  }

  private calculateReward(mileage: number): number {
    return Math.floor(mileage / 10) * Math.pow(10, 18); // 1 B3TR per 10km
  }

  async estimateGas(clause: any): Promise<number> {
    try {
      const gas = await this.connex.thor.estimateGas([clause]);
      return gas;
    } catch (error) {
      this.logger.error("Failed to estimate gas", error);
      return 500000; // Default gas limit
    }
  }
}
```

### Wallet Authentication Service

```typescript
// wallet-auth.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Connex } from "vechain";

@Injectable()
export class WalletAuthService {
  private readonly logger = new Logger(WalletAuthService.name);

  constructor(private jwtService: JwtService) {}

  async verifyWalletSignature(
    walletAddress: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    try {
      const connex = new Connex({
        node: "https://testnet.veblocks.net",
        network: "test",
      });

      const recoveredAddress = connex.utils.recoverAddress(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      this.logger.error("Failed to verify wallet signature", error);
      return false;
    }
  }

  async generateChallengeMessage(walletAddress: string): Promise<string> {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2);

    return `Connect to EV Odometer Rewards\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\nNonce: ${nonce}`;
  }

  async generateToken(walletAddress: string): Promise<string> {
    const payload = {
      walletAddress,
      type: "wallet_auth",
      iat: Date.now(),
    };

    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error("Failed to validate token", error);
      throw new Error("Invalid token");
    }
  }
}
```

## Frontend Integration

### Wallet Connection Hook

```typescript
// hooks/useWallet.ts
import { useState, useEffect, useCallback } from "react";
import { Connex } from "vechain";

interface WalletState {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    connected: false,
    connecting: false,
    error: null,
  });

  const connectWallet = useCallback(async () => {
    setWalletState((prev) => ({ ...prev, connecting: true, error: null }));

    try {
      // Check if VeWorld is available
      if (typeof window !== "undefined" && (window as any).veworld) {
        const veWorld = (window as any).veworld;

        // Request account access
        const account = await veWorld.requestAccount();

        if (account && account.address) {
          setWalletState({
            address: account.address,
            connected: true,
            connecting: false,
            error: null,
          });

          // Store in localStorage
          localStorage.setItem("walletAddress", account.address);
        }
      } else {
        throw new Error(
          "VeWorld wallet not found. Please install VeWorld extension."
        );
      }
    } catch (error) {
      setWalletState((prev) => ({
        ...prev,
        connecting: false,
        error: error.message,
      }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      connected: false,
      connecting: false,
      error: null,
    });

    localStorage.removeItem("walletAddress");
  }, []);

  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!walletState.address) {
        throw new Error("Wallet not connected");
      }

      try {
        const veWorld = (window as any).veworld;
        const signature = await veWorld.signMessage(message);
        return signature;
      } catch (error) {
        throw new Error("Failed to sign message");
      }
    },
    [walletState.address]
  );

  // Auto-connect on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setWalletState((prev) => ({
        ...prev,
        address: savedAddress,
        connected: true,
      }));
    }
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    signMessage,
  };
};
```

### Blockchain API Client

```typescript
// services/blockchain.ts
import { EVOdometerAPI } from "./api";

export class BlockchainService {
  private api: EVOdometerAPI;

  constructor(api: EVOdometerAPI) {
    this.api = api;
  }

  async getBalance(): Promise<number> {
    const response = await this.api.get("/rewards/balance");
    return response.data.currentBalance;
  }

  async getTransactionHistory(page = 1, limit = 20) {
    const response = await this.api.get("/rewards/history", {
      params: { page, limit },
    });
    return response.data;
  }

  async withdrawRewards(amount: number): Promise<string> {
    const response = await this.api.post("/rewards/withdraw", {
      amount,
      walletAddress: this.api.getWalletAddress(),
    });
    return response.data.blockchainTx;
  }

  async getTransactionStatus(txHash: string) {
    const response = await this.api.get(`/blockchain/transaction/${txHash}`);
    return response.data;
  }

  async getNetworkStatus() {
    const response = await this.api.get("/blockchain/status");
    return response.data;
  }
}
```

## Mobile App Integration

### Flutter Blockchain Service

```dart
// services/blockchain_service.dart
import 'package:web3dart/web3dart.dart';
import 'package:http/http.dart' as http;

class BlockchainService {
  late Web3Client _client;
  late DeployedContract _rewardContract;
  late DeployedContract _tokenContract;

  BlockchainService() {
    _initializeClient();
  }

  void _initializeClient() {
    final rpcUrl = 'https://testnet.veblocks.net';
    final httpClient = http.Client();
    _client = Web3Client(rpcUrl, httpClient);

    // Initialize contracts
    _initializeContracts();
  }

  void _initializeContracts() {
    // Load contract ABIs and addresses
    // This would be loaded from assets or configuration
  }

  Future<String> getBalance(String address) async {
    try {
      final balance = await _client.call(
        contract: _tokenContract,
        function: _tokenContract.function('balanceOf'),
        params: [EthereumAddress.fromHex(address)],
      );

      return balance.first.toString();
    } catch (e) {
      throw Exception('Failed to get balance: $e');
    }
  }

  Future<String> withdrawRewards(String privateKey) async {
    try {
      final credentials = EthPrivateKey.fromHex(privateKey);

      final transaction = await _client.sendTransaction(
        credentials,
        Transaction.callContract(
          contract: _rewardContract,
          function: _rewardContract.function('withdrawRewards'),
          params: [],
        ),
        chainId: 39, // VeChain testnet
      );

      return transaction;
    } catch (e) {
      throw Exception('Failed to withdraw rewards: $e');
    }
  }

  Future<Map<String, dynamic>> getTransactionStatus(String txHash) async {
    try {
      final receipt = await _client.getTransactionReceipt(txHash);

      return {
        'txHash': txHash,
        'status': receipt?.status == 1 ? 'confirmed' : 'failed',
        'blockNumber': receipt?.blockNumber,
        'gasUsed': receipt?.gasUsed,
      };
    } catch (e) {
      throw Exception('Failed to get transaction status: $e');
    }
  }
}
```

## Transaction Management

### Transaction Queue System

```typescript
// transaction-queue.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BlockchainService } from "./blockchain.service";

interface PendingTransaction {
  id: string;
  userId: number;
  type: "reward_distribution" | "withdrawal";
  data: any;
  retries: number;
  createdAt: Date;
}

@Injectable()
export class TransactionQueueService {
  private readonly logger = new Logger(TransactionQueueService.name);
  private pendingTransactions: PendingTransaction[] = [];

  constructor(private blockchainService: BlockchainService) {}

  async addToQueue(
    transaction: Omit<PendingTransaction, "id" | "retries" | "createdAt">
  ) {
    const pendingTx: PendingTransaction = {
      ...transaction,
      id: this.generateId(),
      retries: 0,
      createdAt: new Date(),
    };

    this.pendingTransactions.push(pendingTx);
    this.logger.log(`Transaction added to queue: ${pendingTx.id}`);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async processQueue() {
    if (this.pendingTransactions.length === 0) return;

    const transaction = this.pendingTransactions.shift();
    if (!transaction) return;

    try {
      await this.processTransaction(transaction);
    } catch (error) {
      this.logger.error(
        `Failed to process transaction ${transaction.id}`,
        error
      );

      if (transaction.retries < 3) {
        transaction.retries++;
        this.pendingTransactions.push(transaction);
      } else {
        this.logger.error(
          `Transaction ${transaction.id} failed after 3 retries`
        );
        // Notify admin or user about failed transaction
      }
    }
  }

  private async processTransaction(transaction: PendingTransaction) {
    switch (transaction.type) {
      case "reward_distribution":
        await this.blockchainService.distributeReward(
          transaction.data.userAddress,
          transaction.data.mileage,
          transaction.data.uploadId
        );
        break;

      case "withdrawal":
        // Handle withdrawal logic
        break;

      default:
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }
  }

  private generateId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## Error Handling

### Blockchain Error Handling

```typescript
// blockchain-error.handler.ts
import { Injectable, Logger } from "@nestjs/common";

export class BlockchainError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = "BlockchainError";
  }
}

@Injectable()
export class BlockchainErrorHandler {
  private readonly logger = new Logger(BlockchainErrorHandler.name);

  handleError(error: any): BlockchainError {
    this.logger.error("Blockchain error occurred", error);

    if (error.message?.includes("insufficient funds")) {
      return new BlockchainError(
        "Insufficient funds for transaction",
        "INSUFFICIENT_FUNDS",
        { required: error.details?.required }
      );
    }

    if (error.message?.includes("gas limit")) {
      return new BlockchainError(
        "Transaction gas limit exceeded",
        "GAS_LIMIT_EXCEEDED",
        { gasLimit: error.details?.gasLimit }
      );
    }

    if (error.message?.includes("nonce")) {
      return new BlockchainError("Invalid transaction nonce", "INVALID_NONCE", {
        nonce: error.details?.nonce,
      });
    }

    return new BlockchainError(
      "Blockchain transaction failed",
      "UNKNOWN_ERROR",
      { originalError: error.message }
    );
  }

  async retryTransaction<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logger.warn(`Transaction attempt ${attempt} failed`, error);

        if (attempt < maxRetries) {
          await this.delay(delay * attempt); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

## Testing

### Smart Contract Testing

```typescript
// blockchain.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { BlockchainService } from "./blockchain.service";
import { ConfigService } from "@nestjs/config";

describe("BlockchainService", () => {
  let service: BlockchainService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                VECHAIN_NETWORK: "testnet",
                VECHAIN_RPC_URL: "https://testnet.veblocks.net",
                VECHAIN_CONTRACT_ADDRESS: "0x1234567890abcdef...",
                VECHAIN_PRIVATE_KEY: "test_private_key",
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("distributeReward", () => {
    it("should distribute reward successfully", async () => {
      const userAddress = "0x1234567890abcdef...";
      const mileage = 100;
      const uploadId = "test_upload_id";

      const result = await service.distributeReward(
        userAddress,
        mileage,
        uploadId
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle blockchain errors gracefully", async () => {
      const userAddress = "0x1234567890abcdef...";
      const mileage = 100;
      const uploadId = "test_upload_id";

      // Mock blockchain error
      jest.spyOn(service as any, "connex").mockImplementation(() => {
        throw new Error("Blockchain error");
      });

      await expect(
        service.distributeReward(userAddress, mileage, uploadId)
      ).rejects.toThrow("Blockchain transaction failed");
    });
  });
});
```

## Monitoring and Analytics

### Blockchain Monitoring

```typescript
// blockchain-monitor.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BlockchainService } from "./blockchain.service";

@Injectable()
export class BlockchainMonitorService {
  private readonly logger = new Logger(BlockchainMonitorService.name);

  constructor(private blockchainService: BlockchainService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async monitorNetworkStatus() {
    try {
      const status = await this.blockchainService.getNetworkStatus();

      this.logger.log("Network status", {
        blockHeight: status.blockHeight,
        gasPrice: status.gasPrice,
        network: status.network,
      });

      // Alert if gas price is too high
      if (parseInt(status.gasPrice) > 5000000000) {
        this.logger.warn("High gas price detected", {
          gasPrice: status.gasPrice,
        });
      }
    } catch (error) {
      this.logger.error("Failed to monitor network status", error);
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorPendingTransactions() {
    // Monitor pending transactions and retry failed ones
    this.logger.log("Monitoring pending transactions");
  }
}
```

This comprehensive blockchain integration guide provides all the necessary components for integrating VeChain blockchain functionality into the EV Odometer Rewards system, including smart contracts, backend services, frontend integration, and proper error handling.

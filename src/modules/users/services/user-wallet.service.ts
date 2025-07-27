import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserWallet } from "../entity/user-wallet.entity";
import {
  VeChainWalletService,
  VeChainWallet,
} from "../../../common/blockchain/vechain-wallet.service";
import { EncryptionService } from "../../../common/encryption/encryption.service";

@Injectable()
export class UserWalletService {
  private readonly logger = new Logger(UserWalletService.name);

  constructor(
    @InjectRepository(UserWallet)
    private readonly userWalletRepository: Repository<UserWallet>,
    private readonly vechainWalletService: VeChainWalletService,
    private readonly encryptionService: EncryptionService
  ) {}

  /**
   * Create a new wallet for a user and store it securely
   */
  async createUserWallet(userId: string): Promise<{
    walletAddress: string;
    encryptedWallet: {
      mnemonic: string;
      privateKey: string;
      publicKey: string;
    };
  }> {
    try {
      // Check if user already has a wallet
      const existingWallet = await this.userWalletRepository.findOne({
        where: { userId },
      });
      console.log(
        "🚀 ~ UserWalletService ~ createUserWallet ~ existingWallet:",
        existingWallet
      );

      let wallet = null;

      if (!existingWallet) {
        wallet = this.vechainWalletService.generateWallet();
        const encryptedData = this.encryptionService.encryptWalletData({
          mnemonic: wallet.mnemonic,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
        });
        console.log(
          "🚀 ~ UserWalletService ~ createUserWallet ~ encryptedData:",
          encryptedData
        );

        // Store encrypted wallet in database
        const userWallet = this.userWalletRepository.create({
          userId,
          encryptedMnemonic: encryptedData.encryptedMnemonic,
          encryptedPrivateKey: encryptedData.encryptedPrivateKey,
          encryptedPublicKey: encryptedData.encryptedPublicKey,
          walletAddress: wallet.address,
          walletType: "sync2",
          mnemonicIv: encryptedData.mnemonicIv,
          mnemonicSalt: encryptedData.mnemonicSalt,
          privateKeyIv: encryptedData.privateKeyIv,
          privateKeySalt: encryptedData.privateKeySalt,
          publicKeyIv: encryptedData.publicKeyIv,
          publicKeySalt: encryptedData.publicKeySalt,
          isBackedUp: false,
        });

        await this.userWalletRepository.save(userWallet);

        this.logger.log(
          `Created encrypted wallet for user ${userId}: ${wallet.address}`
        );
      } else {
        wallet = existingWallet;
      }

      return {
        walletAddress: wallet.address,
        encryptedWallet: {
          mnemonic: wallet.mnemonic,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create wallet for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user wallet information (encrypted)
   */
  async getUserWallet(userId: string): Promise<UserWallet | null> {
    try {
      return await this.userWalletRepository.findOne({
        where: { userId },
      });
    } catch (error) {
      this.logger.error(`Failed to get wallet for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Decrypt and get user wallet data (requires master key)
   */
  async getDecryptedWallet(
    userId: string,
    masterKey?: string
  ): Promise<{
    mnemonic: string;
    privateKey: string;
    publicKey: string;
    address: string;
  } | null> {
    try {
      const userWallet = await this.getUserWallet(userId);

      if (!userWallet) {
        return null;
      }

      const decryptedData = this.encryptionService.decryptWalletData({
        encryptedMnemonic: userWallet.encryptedMnemonic,
        encryptedPrivateKey: userWallet.encryptedPrivateKey,
        encryptedPublicKey: userWallet.encryptedPublicKey,
        mnemonicIv: userWallet.mnemonicIv,
        mnemonicSalt: userWallet.mnemonicSalt,
        privateKeyIv: userWallet.privateKeyIv,
        privateKeySalt: userWallet.privateKeySalt,
        publicKeyIv: userWallet.publicKeyIv,
        publicKeySalt: userWallet.publicKeySalt,
      });

      return {
        ...decryptedData,
        address: userWallet.walletAddress,
      };
    } catch (error) {
      this.logger.error(`Failed to decrypt wallet for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Mark wallet as backed up
   */
  async markWalletAsBackedUp(userId: string): Promise<void> {
    try {
      await this.userWalletRepository.update(
        { userId },
        {
          isBackedUp: true,
          backedUpAt: new Date(),
        }
      );

      this.logger.log(`Marked wallet as backed up for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to mark wallet as backed up for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update wallet backup status
   */
  async updateWalletBackupStatus(
    userId: string,
    isBackedUp: boolean
  ): Promise<void> {
    try {
      const updateData: any = { isBackedUp };

      if (isBackedUp) {
        updateData.backedUpAt = new Date();
      } else {
        updateData.backedUpAt = null;
      }

      await this.userWalletRepository.update({ userId }, updateData);

      this.logger.log(
        `Updated wallet backup status for user ${userId}: ${isBackedUp}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to update wallet backup status for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete user wallet (for account deletion)
   */
  async deleteUserWallet(userId: string): Promise<void> {
    try {
      await this.userWalletRepository.delete({ userId });
      this.logger.log(`Deleted wallet for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete wallet for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(): Promise<{
    totalWallets: number;
    backedUpWallets: number;
    notBackedUpWallets: number;
  }> {
    try {
      const totalWallets = await this.userWalletRepository.count();
      const backedUpWallets = await this.userWalletRepository.count({
        where: { isBackedUp: true },
      });

      return {
        totalWallets,
        backedUpWallets,
        notBackedUpWallets: totalWallets - backedUpWallets,
      };
    } catch (error) {
      this.logger.error("Failed to get wallet stats:", error);
      throw error;
    }
  }

  /**
   * Validate wallet address
   */
  validateWalletAddress(address: string): boolean {
    return this.vechainWalletService.isValidAddress(address);
  }

  /**
   * Sign message with user's private key
   */
  async signMessage(
    userId: string,
    message: string
  ): Promise<{
    signature: string;
    address: string;
  }> {
    try {
      const decryptedWallet = await this.getDecryptedWallet(userId);

      if (!decryptedWallet) {
        throw new Error("User wallet not found");
      }

      const signature = this.vechainWalletService.signMessage(
        message,
        decryptedWallet.privateKey
      );

      return {
        signature,
        address: decryptedWallet.address,
      };
    } catch (error) {
      this.logger.error(`Failed to sign message for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Verify message signature
   */
  verifySignature(
    message: string,
    signature: string,
    address: string
  ): boolean {
    return this.vechainWalletService.verifySignature(
      message,
      signature,
      address
    );
  }
}

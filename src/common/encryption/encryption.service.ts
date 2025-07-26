import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = "aes-256-gcm";
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 64; // 512 bits
  private readonly tagLength = 16; // 128 bits

  constructor(private readonly configService?: ConfigService) {}

  /**
   * Generate a random salt for key derivation
   */
  private generateSalt(): string {
    return crypto.randomBytes(this.saltLength).toString("hex");
  }

  /**
   * Generate a random initialization vector
   */
  private generateIv(): string {
    return crypto.randomBytes(this.ivLength).toString("hex");
  }

  /**
   * Derive encryption key from master key and salt using PBKDF2
   */
  private deriveKey(masterKey: string, salt: string): Buffer {
    const iterations = 100000; // High iteration count for security
    return crypto.pbkdf2Sync(
      masterKey,
      salt,
      iterations,
      this.keyLength,
      "sha512",
    );
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(
    data: string,
    masterKey?: string,
  ): {
    encryptedData: string;
    iv: string;
    salt: string;
  } {
    try {
      // Use environment variable or generate a temporary key
      const key =
        masterKey ||
        this.configService?.get<string>("ENCRYPTION_MASTER_KEY") ||
        "default-key-change-in-production";

      // Generate salt and IV
      const salt = this.generateSalt();
      const iv = this.generateIv();

      // Derive encryption key
      const derivedKey = this.deriveKey(key, salt);

      // Create cipher
      const cipher = crypto.createCipheriv(
        this.algorithm,
        derivedKey,
        Buffer.from(iv, "hex"),
      );
      cipher.setAAD(Buffer.from("user-wallet-data", "utf8")); // Additional authenticated data

      // Encrypt data
      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Combine encrypted data with tag
      const encryptedData = encrypted + tag.toString("hex");

      this.logger.debug("Data encrypted successfully");

      return {
        encryptedData,
        iv,
        salt,
      };
    } catch (error) {
      this.logger.error("Encryption failed:", error);
      throw new Error("Failed to encrypt data");
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(
    encryptedData: string,
    iv: string,
    salt: string,
    masterKey?: string,
  ): string {
    try {
      // Use environment variable or generate a temporary key
      const key =
        masterKey ||
        this.configService?.get<string>("ENCRYPTION_MASTER_KEY") ||
        "default-key-change-in-production";

      // Derive encryption key
      const derivedKey = this.deriveKey(key, salt);

      // Extract tag from encrypted data
      const tag = Buffer.from(encryptedData.slice(-32), "hex"); // Last 16 bytes (32 hex chars) are the tag
      const actualEncryptedData = encryptedData.slice(0, -32);

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        derivedKey,
        Buffer.from(iv, "hex"),
      );
      decipher.setAAD(Buffer.from("user-wallet-data", "utf8")); // Additional authenticated data
      decipher.setAuthTag(tag);

      // Decrypt data
      let decrypted = decipher.update(actualEncryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");

      this.logger.debug("Data decrypted successfully");

      return decrypted;
    } catch (error) {
      this.logger.error("Decryption failed:", error);
      throw new Error("Failed to decrypt data");
    }
  }

  /**
   * Encrypt wallet data with additional security
   */
  encryptWalletData(walletData: {
    mnemonic: string;
    privateKey: string;
    publicKey: string;
  }): {
    encryptedMnemonic: string;
    encryptedPrivateKey: string;
    encryptedPublicKey: string;
    mnemonicIv: string;
    mnemonicSalt: string;
    privateKeyIv: string;
    privateKeySalt: string;
    publicKeyIv: string;
    publicKeySalt: string;
  } {
    try {
      // Encrypt each piece of data separately with unique IV and salt
      const mnemonicEncryption = this.encrypt(walletData.mnemonic);
      const privateKeyEncryption = this.encrypt(walletData.privateKey);
      const publicKeyEncryption = this.encrypt(walletData.publicKey);

      return {
        encryptedMnemonic: mnemonicEncryption.encryptedData,
        encryptedPrivateKey: privateKeyEncryption.encryptedData,
        encryptedPublicKey: publicKeyEncryption.encryptedData,
        mnemonicIv: mnemonicEncryption.iv,
        mnemonicSalt: mnemonicEncryption.salt,
        privateKeyIv: privateKeyEncryption.iv,
        privateKeySalt: privateKeyEncryption.salt,
        publicKeyIv: publicKeyEncryption.iv,
        publicKeySalt: publicKeyEncryption.salt,
      };
    } catch (error) {
      this.logger.error("Wallet data encryption failed:", error);
      throw new Error("Failed to encrypt wallet data");
    }
  }

  /**
   * Decrypt wallet data
   */
  decryptWalletData(encryptedData: {
    encryptedMnemonic: string;
    encryptedPrivateKey: string;
    encryptedPublicKey: string;
    mnemonicIv: string;
    mnemonicSalt: string;
    privateKeyIv: string;
    privateKeySalt: string;
    publicKeyIv: string;
    publicKeySalt: string;
  }): {
    mnemonic: string;
    privateKey: string;
    publicKey: string;
  } {
    try {
      return {
        mnemonic: this.decrypt(
          encryptedData.encryptedMnemonic,
          encryptedData.mnemonicIv,
          encryptedData.mnemonicSalt,
        ),
        privateKey: this.decrypt(
          encryptedData.encryptedPrivateKey,
          encryptedData.privateKeyIv,
          encryptedData.privateKeySalt,
        ),
        publicKey: this.decrypt(
          encryptedData.encryptedPublicKey,
          encryptedData.publicKeyIv,
          encryptedData.publicKeySalt,
        ),
      };
    } catch (error) {
      this.logger.error("Wallet data decryption failed:", error);
      throw new Error("Failed to decrypt wallet data");
    }
  }

  /**
   * Generate a secure random string for temporary keys
   */
  generateSecureKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Hash data for verification (one-way)
   */
  hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }
}

import { Injectable, Logger } from "@nestjs/common";
import * as bip39 from "bip39";
import { mnemonicToSeedSync } from "bip39";
import * as HDKey from "hdkey";
import { secp256k1, keccak256 } from "thor-devkit";

export interface VeChainWallet {
  address: string;
  privateKey: string;
  mnemonic: string;
  publicKey: string;
}

@Injectable()
export class VeChainWalletService {
  private readonly logger = new Logger(VeChainWalletService.name);

  /**
   * Generate a new VeChain wallet with mnemonic, private key, and address
   */
  generateWallet(): VeChainWallet {
    try {
      // Generate a random mnemonic (12 words)
      const mnemonic = bip39.generateMnemonic(128); // 12 words

      // Convert mnemonic to seed
      const seed = mnemonicToSeedSync(mnemonic);

      // Create HD wallet
      const hdkey = HDKey.fromMasterSeed(seed);

      // Derive the first account (m/44'/818'/0'/0/0 for VeChain)
      // VeChain uses coin type 818
      const childKey = hdkey.derive("m/44'/818'/0'/0/0");

      // Get private key
      const privateKey = childKey.privateKey.toString("hex");

      // Get public key
      const publicKey = secp256k1.derivePublicKey(childKey.privateKey);

      // Generate address from public key
      const address = this.publicKeyToAddress(publicKey);

      this.logger.log(`Generated new VeChain wallet: ${address}`);

      return {
        address,
        privateKey,
        mnemonic,
        publicKey: publicKey.toString("hex"),
      };
    } catch (error) {
      this.logger.error("Failed to generate VeChain wallet:", error);
      throw new Error("Failed to generate VeChain wallet");
    }
  }

  /**
   * Generate wallet from existing mnemonic
   */
  generateWalletFromMnemonic(
    mnemonic: string,
    index: number = 0
  ): VeChainWallet {
    try {
      // Validate mnemonic
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error("Invalid mnemonic");
      }

      // Convert mnemonic to seed
      const seed = mnemonicToSeedSync(mnemonic);

      // Create HD wallet
      const hdkey = HDKey.fromMasterSeed(seed);

      // Derive account at specified index
      const childKey = hdkey.derive(`m/44'/818'/0'/0/${index}`);

      // Get private key
      const privateKey = childKey.privateKey.toString("hex");

      // Get public key
      const publicKey = secp256k1.derivePublicKey(childKey.privateKey);

      // Generate address from public key
      const address = this.publicKeyToAddress(publicKey);

      this.logger.log(
        `Generated VeChain wallet from mnemonic at index ${index}: ${address}`
      );

      return {
        address,
        privateKey,
        mnemonic,
        publicKey: publicKey.toString("hex"),
      };
    } catch (error) {
      this.logger.error(
        "Failed to generate VeChain wallet from mnemonic:",
        error
      );
      throw new Error("Failed to generate VeChain wallet from mnemonic");
    }
  }

  /**
   * Generate wallet from private key
   */
  generateWalletFromPrivateKey(privateKeyHex: string): VeChainWallet {
    try {
      // Validate private key
      const privateKey = Buffer.from(privateKeyHex, "hex");
      if (privateKey.length !== 32) {
        throw new Error("Invalid private key length");
      }

      // Get public key
      const publicKey = secp256k1.derivePublicKey(privateKey);

      // Generate address from public key
      const address = this.publicKeyToAddress(publicKey);

      this.logger.log(`Generated VeChain wallet from private key: ${address}`);

      return {
        address,
        privateKey: privateKeyHex,
        mnemonic: "", // Not available when generating from private key
        publicKey: publicKey.toString("hex"),
      };
    } catch (error) {
      this.logger.error(
        "Failed to generate VeChain wallet from private key:",
        error
      );
      throw new Error("Failed to generate VeChain wallet from private key");
    }
  }

  /**
   * Validate VeChain address
   */
  isValidAddress(address: string): boolean {
    try {
      // VeChain addresses are 42 characters long and start with 0x
      if (!address || address.length !== 42 || !address.startsWith("0x")) {
        return false;
      }

      // Check if it's a valid hex string
      const hexRegex = /^0x[0-9a-fA-F]{40}$/;
      return hexRegex.test(address);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate private key
   */
  isValidPrivateKey(privateKey: string): boolean {
    try {
      if (!privateKey || privateKey.length !== 64) {
        return false;
      }

      // Check if it's a valid hex string
      const hexRegex = /^[0-9a-fA-F]{64}$/;
      return hexRegex.test(privateKey);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate mnemonic
   */
  isValidMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * Convert public key to VeChain address
   */
  private publicKeyToAddress(publicKey: Buffer): string {
    // Remove the prefix byte (0x04) if present
    const pubKey = publicKey.length === 65 ? publicKey.slice(1) : publicKey;

    // Hash the public key
    const hash = keccak256(pubKey);

    // Take the last 20 bytes as the address
    const address = hash.slice(-20);

    // Convert to hex and add 0x prefix
    return "0x" + address.toString("hex");
  }

  /**
   * Sign a message with private key
   */
  signMessage(message: string, privateKeyHex: string): string {
    try {
      const privateKey = Buffer.from(privateKeyHex, "hex");
      const messageHash = keccak256(Buffer.from(message, "utf8"));

      // Sign the message
      const signature = secp256k1.sign(messageHash, privateKey);

      // Return signature in hex format
      return signature.toString("hex");
    } catch (error) {
      this.logger.error("Failed to sign message:", error);
      throw new Error("Failed to sign message");
    }
  }

  /**
   * Verify signature
   */
  verifySignature(
    message: string,
    signature: string,
    address: string
  ): boolean {
    try {
      const messageHash = keccak256(Buffer.from(message, "utf8"));
      const signatureBuffer = Buffer.from(signature, "hex");

      // Recover public key from signature
      const publicKey = secp256k1.recover(messageHash, signatureBuffer);

      // Generate address from public key
      const recoveredAddress = this.publicKeyToAddress(publicKey);

      // Compare addresses (case-insensitive)
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      this.logger.error("Failed to verify signature:", error);
      return false;
    }
  }

  /**
   * Get wallet info without exposing private key
   */
  getWalletInfo(wallet: VeChainWallet): Omit<VeChainWallet, "privateKey"> {
    return {
      address: wallet.address,
      mnemonic: wallet.mnemonic,
      publicKey: wallet.publicKey,
    };
  }

  /**
   * Generate multiple wallets from a single mnemonic
   */
  generateMultipleWallets(
    mnemonic: string,
    count: number = 5
  ): VeChainWallet[] {
    const wallets: VeChainWallet[] = [];

    for (let i = 0; i < count; i++) {
      wallets.push(this.generateWalletFromMnemonic(mnemonic, i));
    }

    return wallets;
  }
}

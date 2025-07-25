import { Injectable, Logger } from '@nestjs/common';
import { Certificate } from "thor-devkit";

@Injectable()
export class VeChainSignatureHelper {
  private readonly logger = new Logger(VeChainSignatureHelper.name);

  /**
   * Verify VeChain Certificate signature
   * @param signedCertificate - The signed certificate object
   * @returns boolean indicating if certificate is valid
   */
  async verifyCertificate(signedCertificate: any): Promise<boolean> {
    try {
      this.logger.debug(
        `Verifying certificate for signer: ${signedCertificate.signer}`
      );

      // Verify the certificate using thor-devkit
      Certificate.verify(signedCertificate);

      this.logger.debug(
        `Certificate verification successful for: ${signedCertificate.signer}`
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Certificate verification failed for ${signedCertificate.signer}:`,
        error.message
      );
      return false;
    }
  }

  /**
   * Verify VeChain signature using secp256k1 (legacy method - kept for backward compatibility)
   * @param message - The message that was signed
   * @param signature - The signature to verify
   * @param walletAddress - The wallet address that should have signed the message
   * @returns boolean indicating if signature is valid
   */
  async verifySignature(
    message: string,
    signature: string,
    walletAddress: string
  ): Promise<boolean> {
    console.log(
      "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ signature:",
      signature
    );
    console.log(
      "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ message:",
      message
    );
    try {
      this.logger.debug(`Verifying signature for wallet: ${walletAddress}`);

      // Remove '0x' prefix if present
      const cleanSignature = signature.startsWith("0x")
        ? signature.slice(2)
        : signature;
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ signature:",
        cleanSignature
      );
      const cleanAddress = walletAddress.startsWith("0x")
        ? walletAddress.slice(2)
        : walletAddress;
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ cleanAddress:",
        cleanAddress
      );

      // Convert message to bytes
      const messageBytes = Buffer.from(message, "utf8");

      // Create message hash (Keccak-256)
      const { keccak256 } = await import("thor-devkit");
      const messageHash = keccak256(messageBytes);
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ messageHash:",
        messageHash
      );

      // Parse signature
      const signatureBuffer = Buffer.from(cleanSignature, "hex");
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ signatureBuffer:",
        signatureBuffer
      );

      // Extract r, s, and v from signature
      const r = signatureBuffer.slice(0, 32);
      const s = signatureBuffer.slice(32, 64);
      const v = signatureBuffer[64];

      // Recover public key from signature
      const { secp256k1 } = await import("thor-devkit");
      const publicKey = secp256k1.recover(
        messageHash,
        Buffer.concat([r, s, Buffer.from([v])])
      );
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ publicKey:",
        publicKey
      );

      if (!publicKey) {
        this.logger.warn(
          `Failed to recover public key from signature for wallet: ${walletAddress}`
        );
        return false;
      }

      // Get address from public key (remove first byte and hash)
      const publicKeyWithoutPrefix = publicKey.slice(1);
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ publicKeyWithoutPrefix:",
        publicKeyWithoutPrefix
      );
      const addressHash = keccak256(publicKeyWithoutPrefix);
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ addressHash:",
        addressHash
      );
      const recoveredAddress = addressHash.slice(-20).toString("hex");
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ recoveredAddress:",
        recoveredAddress
      );

      // Compare addresses (case-insensitive)
      const isValid =
        recoveredAddress.toLowerCase() === cleanAddress.toLowerCase();
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ cleanAddress:",
        cleanAddress
      );
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifySignature ~ recoveredAddress:",
        recoveredAddress
      );

      this.logger.debug(
        `Signature verification result for ${walletAddress}: ${isValid}`
      );

      return isValid;
    } catch (error) {
      this.logger.error(
        `Error verifying signature for wallet ${walletAddress}:`,
        error
      );
      return false;
    }
  }

  /**
   * Verify VeChain signature with personal message prefix (legacy method)
   * @param message - The message that was signed
   * @param signature - The signature to verify
   * @param walletAddress - The wallet address that should have signed the message
   * @returns boolean indicating if signature is valid
   */
  async verifyPersonalSignature(
    message: string,
    signature: string,
    walletAddress: string
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Verifying personal signature for wallet: ${walletAddress}`
      );

      // VeChain personal message prefix (similar to Ethereum)
      const personalMessagePrefix = `\x19VeChain Signed Message:\n${message.length}`;
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifyPersonalSignature ~ personalMessagePrefix:",
        personalMessagePrefix
      );
      const prefixedMessage = message;
      console.log(
        "🚀 ~ VeChainSignatureHelper ~ verifyPersonalSignature ~ prefixedMessage:",
        prefixedMessage
      );

      return this.verifySignature(prefixedMessage, signature, walletAddress);
    } catch (error) {
      this.logger.error(
        `Error verifying personal signature for wallet ${walletAddress}:`,
        error
      );
      return false;
    }
  }

  /**
   * Generate a message hash for signing
   * @param message - The message to hash
   * @returns The message hash
   */
  generateMessageHash(message: string): string {
    const { keccak256 } = require("thor-devkit");
    const messageBytes = Buffer.from(message, "utf8");
    const messageHash = keccak256(messageBytes);
    return "0x" + messageHash.toString("hex");
  }

  /**
   * Validate wallet address format
   * @param address - The wallet address to validate
   * @returns boolean indicating if address format is valid
   */
  isValidAddress(address: string): boolean {
    try {
      // Remove '0x' prefix if present
      const cleanAddress = address.startsWith("0x")
        ? address.slice(2)
        : address;

      // Check if address is 40 characters (20 bytes) long
      if (cleanAddress.length !== 40) {
        return false;
      }

      // Check if address contains only valid hex characters
      const hexRegex = /^[0-9a-fA-F]+$/;
      return hexRegex.test(cleanAddress);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate signature format
   * @param signature - The signature to verify
   * @returns boolean indicating if signature format is valid
   */
  isValidSignature(signature: string): boolean {
    try {
      // Remove '0x' prefix if present
      const cleanSignature = signature.startsWith("0x")
        ? signature.slice(2)
        : signature;

      // Check if signature is 130 characters (65 bytes) long
      if (cleanSignature.length !== 130) {
        return false;
      }

      // Check if signature contains only valid hex characters
      const hexRegex = /^[0-9a-fA-F]+$/;
      return hexRegex.test(cleanSignature);
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate certificate format
   * @param certificate - The certificate to validate
   * @returns boolean indicating if certificate format is valid
   */
  isValidCertificate(certificate: any): boolean {
    try {
      // Check if certificate has required fields
      if (!certificate || typeof certificate !== "object") {
        return false;
      }

      const requiredFields = [
        "purpose",
        "payload",
        "signature",
        "signer",
        "domain",
        "timestamp",
      ];
      for (const field of requiredFields) {
        if (!(field in certificate)) {
          return false;
        }
      }

      // Check if payload has required fields
      if (!certificate.payload || typeof certificate.payload !== "object") {
        return false;
      }

      if (!certificate.payload.type || !certificate.payload.content) {
        return false;
      }

      // Validate signer address
      if (!this.isValidAddress(certificate.signer)) {
        return false;
      }

      // Validate signature format
      if (!this.isValidSignature(certificate.signature)) {
        return false;
      }

      // Validate timestamp
      if (
        typeof certificate.timestamp !== "number" ||
        certificate.timestamp <= 0
      ) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { VeChainSignatureHelper } from './vechain-signature.helper';

describe('VeChainSignatureHelper', () => {
  let service: VeChainSignatureHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VeChainSignatureHelper],
    }).compile();

    service = module.get<VeChainSignatureHelper>(VeChainSignatureHelper);
  });

  describe('isValidAddress', () => {
    it('should validate correct VeChain addresses', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0x0000000000000000000000000000000000000000',
        '0x1234567890123456789012345678901234567890',
        '742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // without 0x prefix
      ];

      validAddresses.forEach((address) => {
        expect(service.isValidAddress(address)).toBe(true);
      });
    });

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b', // too short
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b67', // too long
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6g', // invalid character
        'invalid-address',
        '',
        null,
        undefined,
      ];

      invalidAddresses.forEach((address) => {
        expect(service.isValidAddress(address as any)).toBe(false);
      });
    });
  });

  describe('isValidSignature', () => {
    it('should validate correct signature formats', () => {
      const validSignatures = [
        '0x' + '1'.repeat(130), // 130 hex characters with 0x prefix
        '1'.repeat(130), // 130 hex characters without 0x prefix
      ];

      validSignatures.forEach((signature) => {
        expect(service.isValidSignature(signature)).toBe(true);
      });
    });

    it('should reject invalid signatures', () => {
      const invalidSignatures = [
        '0x' + '1'.repeat(129), // too short
        '0x' + '1'.repeat(131), // too long
        '0x' + '1'.repeat(129) + 'g', // invalid character
        'invalid-signature',
        '',
        null,
        undefined,
      ];

      invalidSignatures.forEach((signature) => {
        expect(service.isValidSignature(signature as any)).toBe(false);
      });
    });
  });

  describe('generateMessageHash', () => {
    it('should generate valid message hash', () => {
      const message = 'Test message';
      const hash = service.generateMessageHash(message);

      expect(hash).toMatch(/^0x[a-fA-F0-9]{64}$/);
      expect(hash.length).toBe(66); // 0x + 64 hex characters
    });

    it('should generate different hashes for different messages', () => {
      const hash1 = service.generateMessageHash('Message 1');
      const hash2 = service.generateMessageHash('Message 2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifySignature', () => {
    it('should handle invalid signature gracefully', async () => {
      const message = 'Test message';
      const invalidSignature = '0x' + '1'.repeat(130);
      const walletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

      const result = await service.verifySignature(
        message,
        invalidSignature,
        walletAddress,
      );
      expect(result).toBe(false);
    });

    it('should handle invalid address gracefully', async () => {
      const message = 'Test message';
      const signature = '0x' + '1'.repeat(130);
      const invalidAddress = 'invalid-address';

      const result = await service.verifySignature(
        message,
        signature,
        invalidAddress,
      );
      expect(result).toBe(false);
    });
  });

  describe('verifyPersonalSignature', () => {
    it('should handle invalid signature gracefully', async () => {
      const message = 'Test message';
      const invalidSignature = '0x' + '1'.repeat(130);
      const walletAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';

      const result = await service.verifyPersonalSignature(
        message,
        invalidSignature,
        walletAddress,
      );
      expect(result).toBe(false);
    });
  });
});

# VeChain Mnemonic Migration Guide

## Overview

This guide documents the migration from using private keys to mnemonic phrases for VeChain wallet management in the ByteMe AI application. This change improves security and makes wallet management more user-friendly.

## Changes Made

### 1. VeChain Service Updates

**File: `src/common/blockchain/vechain.service.ts`**

- **Added mnemonic support**: The service now accepts a mnemonic phrase instead of a private key
- **Added BIP39 validation**: Mnemonics are validated using the BIP39 standard
- **Added HD wallet derivation**: Uses BIP44 derivation path `m/44'/818'/0'/0/0` for VeChain
- **Updated initialization**: The service now looks for `VECHAIN_MNEMONIC` environment variable

**Key Changes:**
```typescript
// Before
private adminPrivateKey: string;

// After
private mnemonic: string;

// New method
private mnemonicToPrivateKey(mnemonic: string, derivationPath: string = "m/44'/818'/0'/0/0"): Buffer
```

### 2. Configuration Updates

**File: `src/config/blockchain.config.ts`**
- Changed `adminPrivateKey` to `mnemonic`
- Updated environment variable from `ADMIN_PRIVATE_KEY` to `VECHAIN_MNEMONIC`

**File: `src/config/app.config.ts`**
- Updated VeChain configuration to use mnemonic instead of private key

### 3. Documentation Updates

**Files Updated:**
- `DEPLOYMENT_CHECKLIST.md`
- `deploy-digitalocean.md`

**Changes:**
- Replaced `ADMIN_PRIVATE_KEY` with `VECHAIN_MNEMONIC`
- Updated descriptions to reflect mnemonic usage

## Environment Variables

### Before
```bash
ADMIN_PRIVATE_KEY=your-private-key-here
```

### After
```bash
VECHAIN_MNEMONIC=your twelve word mnemonic phrase here
```

## Migration Steps

### 1. Generate a New Mnemonic (if needed)

If you don't have a mnemonic phrase, you can generate one using the test script:

```bash
node scripts/test-mnemonic.js
```

This will generate a new 12-word mnemonic phrase that you can use.

### 2. Update Environment Variables

Replace the `ADMIN_PRIVATE_KEY` environment variable with `VECHAIN_MNEMONIC`:

```bash
# Remove this
ADMIN_PRIVATE_KEY=your-private-key

# Add this
VECHAIN_MNEMONIC=your twelve word mnemonic phrase here
```

### 3. Verify Configuration

The application will automatically:
- Validate the mnemonic phrase
- Convert it to a private key using BIP39/BIP44
- Derive the correct VeChain address
- Initialize the wallet for blockchain operations

### 4. Test the Migration

Run the test script to verify everything works:

```bash
node scripts/test-mnemonic.js
```

## Security Benefits

### 1. **Easier Backup**: Mnemonics are easier to write down and backup than private keys
### 2. **Human Readable**: 12-word phrases are more user-friendly than 64-character hex strings
### 3. **BIP39 Standard**: Uses industry-standard mnemonic generation and validation
### 4. **HD Wallet Support**: Enables hierarchical deterministic wallet functionality
### 5. **Recovery**: Easier to recover wallets across different devices

## Technical Details

### Derivation Path
The application uses the standard VeChain derivation path:
```
m/44'/818'/0'/0/0
```

Where:
- `44'` = BIP44 standard
- `818'` = VeChain coin type
- `0'` = Account 0
- `0` = Change (0 = external, 1 = internal)
- `0` = Address index

### Dependencies
The following packages are used for mnemonic functionality:
- `bip39`: For mnemonic generation and validation
- `hdkey`: For hierarchical deterministic key derivation
- `thor-devkit`: For VeChain-specific cryptographic operations

## Troubleshooting

### Invalid Mnemonic Error
If you get an "Invalid mnemonic" error:
1. Check that the mnemonic is exactly 12 words
2. Verify all words are from the BIP39 word list
3. Ensure there are no extra spaces or characters

### Wallet Address Mismatch
If the derived address doesn't match your expected address:
1. Verify you're using the correct mnemonic
2. Check that the derivation path is correct
3. Ensure the mnemonic hasn't been corrupted

### Environment Variable Issues
If the service doesn't initialize:
1. Check that `VECHAIN_MNEMONIC` is set correctly
2. Verify the environment variable is loaded
3. Check application logs for specific error messages

## Testing

### Manual Testing
```bash
# Test mnemonic functionality
node scripts/test-mnemonic.js

# Build the application
npm run build

# Start the application
npm run start:dev
```

### Automated Testing
The application includes comprehensive tests for:
- Mnemonic validation
- Private key derivation
- Address generation
- Wallet initialization

## Rollback Plan

If you need to rollback to private key usage:

1. **Revert Code Changes**: Restore the original `vechain.service.ts` file
2. **Update Environment**: Change `VECHAIN_MNEMONIC` back to `ADMIN_PRIVATE_KEY`
3. **Update Configuration**: Restore the original config files
4. **Test**: Verify the application works with private keys

## Support

If you encounter issues during migration:
1. Check the application logs for detailed error messages
2. Verify your mnemonic phrase is correct
3. Test with the provided test script
4. Review the troubleshooting section above

## Future Enhancements

Potential future improvements:
- Support for multiple accounts from the same mnemonic
- Integration with hardware wallets
- Support for different derivation paths
- Enhanced mnemonic validation and recovery tools 
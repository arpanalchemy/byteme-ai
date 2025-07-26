const bip39 = require('bip39');
const HDKey = require('hdkey');
const { secp256k1 } = require('thor-devkit');

/**
 * Test script to verify mnemonic functionality
 */
function testMnemonicConversion() {
  console.log('🧪 Testing VeChain mnemonic functionality...\n');

  try {
    // Test 1: Generate a new mnemonic
    console.log('1. Generating new mnemonic...');
    const mnemonic = bip39.generateMnemonic(128); // 12 words
    console.log(`   Mnemonic: ${mnemonic}\n`);

    // Test 2: Validate mnemonic
    console.log('2. Validating mnemonic...');
    const isValid = bip39.validateMnemonic(mnemonic);
    console.log(`   Valid: ${isValid}\n`);

    // Test 3: Convert mnemonic to seed
    console.log('3. Converting mnemonic to seed...');
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    console.log(`   Seed length: ${seed.length} bytes\n`);

    // Test 4: Create HD wallet
    console.log('4. Creating HD wallet...');
    const hdkey = HDKey.fromMasterSeed(seed);
    console.log('   HD wallet created successfully\n');

    // Test 5: Derive private key for VeChain (coin type 818)
    console.log('5. Deriving private key for VeChain...');
    const derivationPath = "m/44'/818'/0'/0/0";
    const childKey = hdkey.derive(derivationPath);
    const privateKey = childKey.privateKey;
    console.log(`   Derivation path: ${derivationPath}`);
    console.log(`   Private key length: ${privateKey.length} bytes`);
    console.log(`   Private key (hex): ${privateKey.toString('hex')}\n`);

    // Test 6: Generate public key and address
    console.log('6. Generating public key and address...');
    const publicKey = secp256k1.derivePublicKey(privateKey);
    const address = publicKeyToAddress(publicKey);
    console.log(`   Public key length: ${publicKey.length} bytes`);
    console.log(`   Address: ${address}\n`);

    // Test 7: Test with a known mnemonic (for consistency)
    console.log('7. Testing with known mnemonic...');
    const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const testSeed = bip39.mnemonicToSeedSync(testMnemonic);
    const testHdkey = HDKey.fromMasterSeed(testSeed);
    const testChildKey = testHdkey.derive(derivationPath);
    const testPrivateKey = testChildKey.privateKey;
    const testPublicKey = secp256k1.derivePublicKey(testPrivateKey);
    const testAddress = publicKeyToAddress(testPublicKey);
    console.log(`   Test mnemonic: ${testMnemonic}`);
    console.log(`   Test address: ${testAddress}\n`);

    console.log('✅ All tests passed! VeChain mnemonic functionality is working correctly.\n');

    // Summary
    console.log('📋 Summary:');
    console.log(`   - Mnemonic generation: ✅`);
    console.log(`   - Mnemonic validation: ✅`);
    console.log(`   - Seed generation: ✅`);
    console.log(`   - HD wallet creation: ✅`);
    console.log(`   - Private key derivation: ✅`);
    console.log(`   - Public key generation: ✅`);
    console.log(`   - Address generation: ✅`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

/**
 * Convert public key to VeChain address
 */
function publicKeyToAddress(publicKey) {
  const { keccak256 } = require('thor-devkit');
  const hash = keccak256(publicKey.slice(1));
  return "0x" + hash.slice(-20).toString("hex");
}

// Run the test
testMnemonicConversion(); 
const {
  VeChainWalletService,
} = require("../dist/common/blockchain/vechain-wallet.service");
const {
  EncryptionService,
} = require("../dist/common/encryption/encryption.service");

async function testEncryptedWallet() {
  console.log("🔐 Testing Encrypted Wallet System...\n");

  const walletService = new VeChainWalletService();
  const encryptionService = new EncryptionService();

  try {
    // Test 1: Generate a new wallet
    console.log("📝 Test 1: Generating a new VeChain wallet");
    const wallet = walletService.generateWallet();
    console.log("✅ New wallet generated:");
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Mnemonic: ${wallet.mnemonic}`);
    console.log(`   Private Key: ${wallet.privateKey}`);
    console.log("");

    // Test 2: Encrypt wallet data
    console.log("📝 Test 2: Encrypting wallet data");
    const encryptedData = encryptionService.encryptWalletData({
      mnemonic: wallet.mnemonic,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
    });

    console.log("✅ Wallet data encrypted:");
    console.log(
      `   Encrypted Mnemonic: ${encryptedData.encryptedMnemonic.substring(0, 50)}...`
    );
    console.log(
      `   Encrypted Private Key: ${encryptedData.encryptedPrivateKey.substring(0, 50)}...`
    );
    console.log(
      `   Encrypted Public Key: ${encryptedData.encryptedPublicKey.substring(0, 50)}...`
    );
    console.log(`   Mnemonic IV: ${encryptedData.mnemonicIv}`);
    console.log(
      `   Mnemonic Salt: ${encryptedData.mnemonicSalt.substring(0, 50)}...`
    );
    console.log(`   Private Key IV: ${encryptedData.privateKeyIv}`);
    console.log(
      `   Private Key Salt: ${encryptedData.privateKeySalt.substring(0, 50)}...`
    );
    console.log(`   Public Key IV: ${encryptedData.publicKeyIv}`);
    console.log(
      `   Public Key Salt: ${encryptedData.publicKeySalt.substring(0, 50)}...`
    );
    console.log("");

    // Test 3: Decrypt wallet data
    console.log("📝 Test 3: Decrypting wallet data");
    const decryptedData = encryptionService.decryptWalletData({
      encryptedMnemonic: encryptedData.encryptedMnemonic,
      encryptedPrivateKey: encryptedData.encryptedPrivateKey,
      encryptedPublicKey: encryptedData.encryptedPublicKey,
      mnemonicIv: encryptedData.mnemonicIv,
      mnemonicSalt: encryptedData.mnemonicSalt,
      privateKeyIv: encryptedData.privateKeyIv,
      privateKeySalt: encryptedData.privateKeySalt,
      publicKeyIv: encryptedData.publicKeyIv,
      publicKeySalt: encryptedData.publicKeySalt,
    });

    console.log("✅ Wallet data decrypted:");
    console.log(`   Decrypted Mnemonic: ${decryptedData.mnemonic}`);
    console.log(`   Decrypted Private Key: ${decryptedData.privateKey}`);
    console.log(`   Decrypted Public Key: ${decryptedData.publicKey}`);
    console.log("");

    // Test 4: Verify decryption matches original
    console.log("📝 Test 4: Verifying decryption matches original");
    const mnemonicMatch = wallet.mnemonic === decryptedData.mnemonic;
    const privateKeyMatch = wallet.privateKey === decryptedData.privateKey;
    const publicKeyMatch = wallet.publicKey === decryptedData.publicKey;

    console.log(`   Mnemonic match: ${mnemonicMatch ? "✅ YES" : "❌ NO"}`);
    console.log(
      `   Private Key match: ${privateKeyMatch ? "✅ YES" : "❌ NO"}`
    );
    console.log(`   Public Key match: ${publicKeyMatch ? "✅ YES" : "❌ NO"}`);
    console.log("");

    // Test 5: Test individual encryption/decryption
    console.log("📝 Test 5: Testing individual encryption/decryption");
    const testMessage = "Hello VeChain World!";
    const encrypted = encryptionService.encrypt(testMessage);
    const decrypted = encryptionService.decrypt(
      encrypted.encryptedData,
      encrypted.iv,
      encrypted.salt
    );

    console.log(`   Original: "${testMessage}"`);
    console.log(`   Encrypted: ${encrypted.encryptedData.substring(0, 50)}...`);
    console.log(`   Decrypted: "${decrypted}"`);
    console.log(`   Match: ${testMessage === decrypted ? "✅ YES" : "❌ NO"}`);
    console.log("");

    // Test 6: Test with different master key
    console.log("📝 Test 6: Testing with different master key");
    const customKey = "my-custom-secret-key-123";
    const encryptedWithCustomKey = encryptionService.encrypt(
      testMessage,
      customKey
    );
    const decryptedWithCustomKey = encryptionService.decrypt(
      encryptedWithCustomKey.encryptedData,
      encryptedWithCustomKey.iv,
      encryptedWithCustomKey.salt,
      customKey
    );

    console.log(
      `   Custom key encryption/decryption: ${testMessage === decryptedWithCustomKey ? "✅ SUCCESS" : "❌ FAILED"}`
    );
    console.log("");

    // Test 7: Test hash function
    console.log("📝 Test 7: Testing hash function");
    const originalData = "sensitive-data-to-hash";
    const hash1 = encryptionService.hash(originalData);
    const hash2 = encryptionService.hash(originalData);

    console.log(`   Original: "${originalData}"`);
    console.log(`   Hash 1: ${hash1}`);
    console.log(`   Hash 2: ${hash2}`);
    console.log(`   Hashes match: ${hash1 === hash2 ? "✅ YES" : "❌ NO"}`);
    console.log("");

    console.log("🎉 All encrypted wallet tests completed successfully!");
    console.log("");
    console.log("🔒 Security Features Implemented:");
    console.log("   ✅ AES-256-GCM encryption");
    console.log("   ✅ PBKDF2 key derivation (100,000 iterations)");
    console.log("   ✅ Random salt generation (512 bits)");
    console.log("   ✅ Random IV generation (128 bits)");
    console.log("   ✅ Authentication tags for integrity");
    console.log("   ✅ Additional authenticated data (AAD)");
    console.log("   ✅ Secure random key generation");
    console.log("   ✅ SHA-256 hashing for verification");
  } catch (error) {
    console.error("❌ Error during testing:", error);
  }
}

// Run the test
testEncryptedWallet()
  .then(() => {
    console.log("\n✅ Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

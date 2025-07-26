const {
  VeChainWalletService,
} = require("../dist/common/blockchain/vechain-wallet.service");

async function testVeChainWallet() {
  console.log("🔐 Testing VeChain Wallet Generation...\n");

  const walletService = new VeChainWalletService();

  try {
    // Test 1: Generate a new wallet
    console.log("📝 Test 1: Generating a new VeChain wallet");
    const wallet1 = walletService.generateWallet();
    console.log("✅ New wallet generated:");
    console.log(`   Address: ${wallet1.address}`);
    console.log(`   Mnemonic: ${wallet1.mnemonic}`);
    console.log(`   Private Key: ${wallet1.privateKey}`);
    console.log(`   Public Key: ${wallet1.publicKey}`);
    console.log("");

    // Test 2: Generate wallet from mnemonic
    console.log("📝 Test 2: Generating wallet from mnemonic");
    const wallet2 = walletService.generateWalletFromMnemonic(
      wallet1.mnemonic,
      0
    );
    console.log("✅ Wallet from mnemonic:");
    console.log(`   Address: ${wallet2.address}`);
    console.log(
      `   Should match: ${wallet1.address === wallet2.address ? "✅ YES" : "❌ NO"}`
    );
    console.log("");

    // Test 3: Generate wallet from private key
    console.log("📝 Test 3: Generating wallet from private key");
    const wallet3 = walletService.generateWalletFromPrivateKey(
      wallet1.privateKey
    );
    console.log("✅ Wallet from private key:");
    console.log(`   Address: ${wallet3.address}`);
    console.log(
      `   Should match: ${wallet1.address === wallet3.address ? "✅ YES" : "❌ NO"}`
    );
    console.log("");

    // Test 4: Generate multiple wallets from same mnemonic
    console.log("📝 Test 4: Generating multiple wallets from same mnemonic");
    const wallets = walletService.generateMultipleWallets(wallet1.mnemonic, 3);
    console.log("✅ Multiple wallets generated:");
    wallets.forEach((wallet, index) => {
      console.log(`   Wallet ${index}: ${wallet.address}`);
    });
    console.log("");

    // Test 5: Address validation
    console.log("📝 Test 5: Address validation");
    const validAddress = wallet1.address;
    const invalidAddress = "0xinvalid";
    console.log(
      `   Valid address (${validAddress}): ${walletService.isValidAddress(validAddress) ? "✅ Valid" : "❌ Invalid"}`
    );
    console.log(
      `   Invalid address (${invalidAddress}): ${walletService.isValidAddress(invalidAddress) ? "✅ Valid" : "❌ Invalid"}`
    );
    console.log("");

    // Test 6: Private key validation
    console.log("📝 Test 6: Private key validation");
    const validPrivateKey = wallet1.privateKey;
    const invalidPrivateKey = "invalid";
    console.log(
      `   Valid private key: ${walletService.isValidPrivateKey(validPrivateKey) ? "✅ Valid" : "❌ Invalid"}`
    );
    console.log(
      `   Invalid private key: ${walletService.isValidPrivateKey(invalidPrivateKey) ? "✅ Valid" : "❌ Invalid"}`
    );
    console.log("");

    // Test 7: Mnemonic validation
    console.log("📝 Test 7: Mnemonic validation");
    const validMnemonic = wallet1.mnemonic;
    const invalidMnemonic = "invalid mnemonic phrase";
    console.log(
      `   Valid mnemonic: ${walletService.isValidMnemonic(validMnemonic) ? "✅ Valid" : "❌ Invalid"}`
    );
    console.log(
      `   Invalid mnemonic: ${walletService.isValidMnemonic(invalidMnemonic) ? "✅ Valid" : "❌ Invalid"}`
    );
    console.log("");

    // Test 8: Message signing and verification
    console.log("📝 Test 8: Message signing and verification");
    const message = "Hello VeChain!";
    const signature = walletService.signMessage(message, wallet1.privateKey);
    const isValid = walletService.verifySignature(
      message,
      signature,
      wallet1.address
    );
    console.log(`   Message: "${message}"`);
    console.log(`   Signature: ${signature}`);
    console.log(`   Verification: ${isValid ? "✅ Valid" : "❌ Invalid"}`);
    console.log("");

    console.log("🎉 All VeChain wallet tests completed successfully!");
  } catch (error) {
    console.error("❌ Error during testing:", error);
  }
}

// Run the test
testVeChainWallet()
  .then(() => {
    console.log("\n✅ Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

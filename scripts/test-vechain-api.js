const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:3000";
const JWT_TOKEN = process.env.JWT_TOKEN || "your-jwt-token-here";

// Test data
const TEST_USER_ADDRESS = "0x1234567890abcdef";
const TEST_TXID = "0xabcdef1234567890";

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

// Test functions
async function testServiceStatus() {
  console.log("🔍 Testing Service Status...");
  const result = await makeRequest("GET", "/vechain/status");
  console.log("Service Status:", result);
  return result.success;
}

async function testCurrentCycle() {
  console.log("🔄 Testing Current Cycle...");
  const result = await makeRequest("GET", "/vechain/cycle/current");
  console.log("Current Cycle:", result);
  return result.success;
}

async function testCycleInfo() {
  console.log("📊 Testing Cycle Info...");
  const result = await makeRequest("GET", "/vechain/cycle/1");
  console.log("Cycle Info:", result);
  return result.success;
}

async function testAvailableFunds() {
  console.log("💰 Testing Available Funds...");
  const result = await makeRequest("GET", "/vechain/funds/available");
  console.log("Available Funds:", result);
  return result.success;
}

async function testUserData() {
  console.log("👤 Testing User Data...");
  const result = await makeRequest("GET", `/vechain/user/${TEST_USER_ADDRESS}`);
  console.log("User Data:", result);
  return result.success;
}

async function testGlobalStats() {
  console.log("📈 Testing Global Stats...");
  const result = await makeRequest("GET", "/vechain/stats/global");
  console.log("Global Stats:", result);
  return result.success;
}

async function testSetRewardForCycle() {
  console.log("🎯 Testing Set Reward for Cycle...");
  const data = { rewardAmount: 1000000 };
  const result = await makeRequest("POST", "/vechain/cycle/reward", data);
  console.log("Set Reward for Cycle:", result);
  return result.success;
}

async function testSetRewardForActiveChallenge() {
  console.log("🎯 Testing Set Reward for Active Challenge...");
  const result = await makeRequest(
    "POST",
    "/vechain/cycle/reward/active-challenge"
  );
  console.log("Set Reward for Active Challenge:", result);
  return result.success;
}

async function testDistributeRewards() {
  console.log("🎁 Testing Distribute Rewards...");
  const data = {
    batchData: [
      {
        user: TEST_USER_ADDRESS,
        miles: 150.5,
        amount: 100.0,
        proofTypes: ["odometer", "gps"],
        proofValues: ["150.5", "150.3"],
        impactCodes: ["carbon_saved", "fuel_efficiency"],
        impactValues: [25.3, 15.2],
        description: "Weekly reward for eco-friendly driving",
      },
    ],
  };
  const result = await makeRequest("POST", "/vechain/rewards/distribute", data);
  console.log("Distribute Rewards:", result);
  return result.success;
}

async function testTransactionReceipt() {
  console.log("📄 Testing Transaction Receipt...");
  const result = await makeRequest(
    "GET",
    `/vechain/transaction/${TEST_TXID}/receipt`
  );
  console.log("Transaction Receipt:", result);
  return result.success;
}

async function testTransactionConfirmed() {
  console.log("✅ Testing Transaction Confirmation...");
  const result = await makeRequest(
    "GET",
    `/vechain/transaction/${TEST_TXID}/confirmed`
  );
  console.log("Transaction Confirmation:", result);
  return result.success;
}

async function testBalance() {
  console.log("💳 Testing Balance...");
  const result = await makeRequest(
    "GET",
    `/vechain/balance/${TEST_USER_ADDRESS}`
  );
  console.log("Balance:", result);
  return result.success;
}

async function testB3TRBalance() {
  console.log("🪙 Testing B3TR Balance...");
  const result = await makeRequest(
    "GET",
    `/vechain/balance/${TEST_USER_ADDRESS}/b3tr`
  );
  console.log("B3TR Balance:", result);
  return result.success;
}

async function testNetworkHealth() {
  console.log("🏥 Testing Network Health...");
  const result = await makeRequest("GET", "/vechain/network/health");
  console.log("Network Health:", result);
  return result.success;
}

async function testTransfer() {
  console.log("💸 Testing Transfer...");
  const data = {
    fromAddress: TEST_USER_ADDRESS,
    toAddress: "0xabcdef1234567890",
    amount: 100,
  };
  const result = await makeRequest("POST", "/vechain/transfer", data);
  console.log("Transfer:", result);
  return result.success;
}

async function testNetworkStats() {
  console.log("📊 Testing Network Stats...");
  const result = await makeRequest("GET", "/vechain/network/stats");
  console.log("Network Stats:", result);
  return result.success;
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting VeChain API Tests...\n");

  const tests = [
    { name: "Service Status", fn: testServiceStatus },
    { name: "Current Cycle", fn: testCurrentCycle },
    { name: "Cycle Info", fn: testCycleInfo },
    { name: "Available Funds", fn: testAvailableFunds },
    { name: "User Data", fn: testUserData },
    { name: "Global Stats", fn: testGlobalStats },
    { name: "Set Reward for Cycle", fn: testSetRewardForCycle },
    {
      name: "Set Reward for Active Challenge",
      fn: testSetRewardForActiveChallenge,
    },
    { name: "Distribute Rewards", fn: testDistributeRewards },
    { name: "Transaction Receipt", fn: testTransactionReceipt },
    { name: "Transaction Confirmation", fn: testTransactionConfirmed },
    { name: "Balance", fn: testBalance },
    { name: "B3TR Balance", fn: testB3TRBalance },
    { name: "Network Health", fn: testNetworkHealth },
    { name: "Transfer", fn: testTransfer },
    { name: "Network Stats", fn: testNetworkStats },
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\n${"=".repeat(50)}`);
    const success = await test.fn();
    results.push({ name: test.name, success });
    console.log(`${"=".repeat(50)}\n`);
  }

  // Summary
  console.log("\n📋 Test Summary:");
  console.log("=".repeat(50));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result) => {
    const status = result.success ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${result.name}`);
  });

  console.log("\n" + "=".repeat(50));
  console.log(
    `Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`
  );

  if (failed === 0) {
    console.log("🎉 All tests passed!");
  } else {
    console.log("⚠️  Some tests failed. Check the output above for details.");
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  if (!JWT_TOKEN || JWT_TOKEN === "your-jwt-token-here") {
    console.error(
      "❌ Please set JWT_TOKEN environment variable or update the script with a valid token"
    );
    process.exit(1);
  }

  runAllTests().catch(console.error);
}

module.exports = {
  makeRequest,
  runAllTests,
};

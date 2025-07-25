#!/usr/bin/env node

const http = require("http");
const https = require("https");

// Configuration
const config = {
  port: process.env.PORT || 3000,
  host: "localhost",
  healthCheckPath: "/healthcheck",
  timeout: 5000,
};

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.setTimeout(options.timeout || config.timeout);
    req.end();
  });
}

async function checkLocalHealth() {
  log("\n🔍 Checking local health check endpoint...", "blue");

  try {
    const response = await makeRequest(
      `http://${config.host}:${config.port}${config.healthCheckPath}`
    );

    if (response.statusCode === 200) {
      log("✅ Local health check passed", "green");
      log(`Status Code: ${response.statusCode}`, "green");
      log(`Response: ${response.data}`, "green");
      return true;
    } else {
      log("❌ Local health check failed", "red");
      log(`Status Code: ${response.statusCode}`, "red");
      log(`Response: ${response.data}`, "red");
      return false;
    }
  } catch (error) {
    log("❌ Local health check failed", "red");
    log(`Error: ${error.message}`, "red");
    return false;
  }
}

async function checkRootEndpoint() {
  log("\n🔍 Checking root endpoint...", "blue");

  try {
    const response = await makeRequest(`http://${config.host}:${config.port}/`);

    if (response.statusCode === 200) {
      log("✅ Root endpoint accessible", "green");
      log(`Status Code: ${response.statusCode}`, "green");
      return true;
    } else {
      log("❌ Root endpoint failed", "red");
      log(`Status Code: ${response.statusCode}`, "red");
      return false;
    }
  } catch (error) {
    log("❌ Root endpoint failed", "red");
    log(`Error: ${error.message}`, "red");
    return false;
  }
}

async function checkPortAvailability() {
  log("\n🔍 Checking port availability...", "blue");

  return new Promise((resolve) => {
    const server = http.createServer();

    server.listen(config.port, config.host, () => {
      log(`✅ Port ${config.port} is available`, "green");
      server.close();
      resolve(true);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        log(`❌ Port ${config.port} is already in use`, "red");
        log(
          "Try using a different port or stop the existing process",
          "yellow"
        );
      } else {
        log(`❌ Port ${config.port} error: ${error.message}`, "red");
      }
      resolve(false);
    });
  });
}

async function checkEnvironmentVariables() {
  log("\n🔍 Checking environment variables...", "blue");

  const requiredVars = [
    "NODE_ENV",
    "PORT",
    "DB_HOST",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_NAME",
  ];

  const optionalVars = [
    "REDIS_URL",
    "JWT_SECRET",
    "VECHAIN_NETWORK",
    "AWS_ACCESS_KEY_ID",
    "OPENAI_API_KEY",
  ];

  log("Required environment variables:", "yellow");
  let allRequiredPresent = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      log(
        `  ✅ ${varName}: ${varName.includes("PASSWORD") || varName.includes("SECRET") ? "***" : value}`,
        "green"
      );
    } else {
      log(`  ❌ ${varName}: Not set`, "red");
      allRequiredPresent = false;
    }
  }

  log("\nOptional environment variables:", "yellow");
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      log(
        `  ✅ ${varName}: ${varName.includes("KEY") || varName.includes("SECRET") ? "***" : value}`,
        "green"
      );
    } else {
      log(`  ⚠️  ${varName}: Not set (optional)`, "yellow");
    }
  }

  return allRequiredPresent;
}

async function checkProcessInfo() {
  log("\n🔍 Checking process information...", "blue");

  log(`Node.js version: ${process.version}`, "green");
  log(`Platform: ${process.platform}`, "green");
  log(`Architecture: ${process.arch}`, "green");
  log(`Current working directory: ${process.cwd()}`, "green");
  log(`Process ID: ${process.pid}`, "green");
  log(`Uptime: ${process.uptime()} seconds`, "green");
  log(
    `Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    "green"
  );
}

async function runDiagnostics() {
  log("🚀 DigitalOcean Health Check Diagnostic Tool", "blue");
  log("============================================", "blue");

  // Check process info
  await checkProcessInfo();

  // Check environment variables
  const envOk = await checkEnvironmentVariables();

  // Check port availability
  const portOk = await checkPortAvailability();

  // Check root endpoint
  const rootOk = await checkRootEndpoint();

  // Check health check endpoint
  const healthOk = await checkLocalHealth();

  // Summary
  log("\n📊 Diagnostic Summary", "blue");
  log("==================", "blue");

  if (envOk && portOk && rootOk && healthOk) {
    log(
      "✅ All checks passed! Your application should work on DigitalOcean.",
      "green"
    );
  } else {
    log(
      "❌ Some checks failed. Please fix the issues above before deploying.",
      "red"
    );

    if (!envOk) {
      log("💡 Fix: Set all required environment variables", "yellow");
    }
    if (!portOk) {
      log(
        "💡 Fix: Change PORT environment variable or stop conflicting process",
        "yellow"
      );
    }
    if (!rootOk || !healthOk) {
      log(
        "💡 Fix: Ensure your application is running and endpoints are accessible",
        "yellow"
      );
    }
  }

  log("\n🔧 Next Steps:", "blue");
  log("1. Fix any issues identified above", "yellow");
  log("2. Test your application locally: npm run start:prod", "yellow");
  log("3. Deploy to DigitalOcean with proper environment variables", "yellow");
  log("4. Monitor the deployment logs in DigitalOcean dashboard", "yellow");
}

// Run diagnostics
runDiagnostics().catch((error) => {
  log(`❌ Diagnostic failed: ${error.message}`, "red");
  process.exit(1);
});

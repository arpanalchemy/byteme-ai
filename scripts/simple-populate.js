const { Pool } = require("pg");

// Database configuration
const pool = new Pool({
  host:
    process.env.DB_HOST ||
    "byte-me-instance-1.c1yc40cskc5f.ca-central-1.rds.amazonaws.com",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "byteme-ai",
  user: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "i!m%GpJ;x$8$vx&",
});

// Existing users from your data
const existingUsers = [
  {
    id: "a944016f-ef7b-4040-b276-643f361bb257",
    name: "AppTester",
    email: "AppTester@mailinator.com",
    walletAddress: "0x24573b50c8172ecb900059a2f77736f2168720de",
    walletType: "sync2",
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "eb895d62-8df9-4fa2-8943-752b3d1c9b25",
    name: "datta",
    email: "datta@example.com",
    walletAddress: "0x595c73ec5279a3833ba535753bfd762da6bbac1d",
    walletType: "veworld",
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "c696b12b-9b3e-4f07-9f8b-d64439c940eb",
    name: "Demo User 1",
    email: "demo0001@yopmail.com",
    walletAddress: null,
    walletType: null,
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "9052cf3f-8326-4891-9981-c6a230a09079",
    name: "Demo User 2",
    email: "demo0002@yopmail.com",
    walletAddress: null,
    walletType: null,
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "a3004f1b-745a-4647-8655-b56d24c6d763",
    name: "Demo User 25",
    email: "demo00025@yopmail.com",
    walletAddress: "0x0d6aed50b3feafba75e3e4d9df5056ff7f8d9715",
    walletType: "sync2",
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "9da7ca1b-bed8-4fcd-b051-9fb41e47833e",
    name: "Dhara",
    email: "dhara@alchemytech.ca",
    walletAddress: "0xda40c5bedb2dbf94e0dcd69149760106422cbf11",
    walletType: "sync2",
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "1517aa5a-5f4c-431a-9248-08ac453435e9",
    name: "Demo User 26",
    email: "demo00026@yopmail.com",
    walletAddress: null,
    walletType: null,
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "207428b2-0e66-4814-ac1f-373af59944e8",
    name: "Demo User 679",
    email: "demo000679@yopmail.com",
    walletAddress: "0xa1d4fcddab0d308acb3ee5c29cfa187d2d7de787",
    walletType: "sync2",
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "716873d5-2af0-478b-b7d7-3ee4cc3bbfc7",
    name: "john_doe",
    email: "john01@yopmail.com",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    walletType: "veworld",
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "52dae707-0fd3-4575-8d64-45673562fcf5",
    name: "Non Existent User",
    email: "nonexistent@example.com",
    walletAddress: null,
    walletType: null,
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
  {
    id: "c08658df-283c-4f3d-9e0c-6a007f15f76f",
    name: "Test User",
    email: "test@example.com",
    walletAddress: null,
    walletType: null,
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
];

// Add some new users with realistic data
const newUsers = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Alice Johnson",
    email: "alice@example.com",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    walletType: "veworld",
    tier: "silver",
    totalRewards: 150.5,
    totalCarbonSaved: 25.75,
    totalMiles: 1250,
    points: 1250,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Bob Smith",
    email: "bob@example.com",
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    walletType: "sync2",
    tier: "gold",
    totalRewards: 320.75,
    totalCarbonSaved: 45.2,
    totalMiles: 2800,
    points: 2800,
  },
  {
    id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    name: "Carol Davis",
    email: "carol@example.com",
    walletAddress: "0x9876543210fedcba9876543210fedcba98765432",
    walletType: "veworld",
    tier: "platinum",
    totalRewards: 750.25,
    totalCarbonSaved: 85.5,
    totalMiles: 5200,
    points: 5200,
  },
];

const allUsers = [...existingUsers, ...newUsers];

async function populateDatabase() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting simplified database population...");

    // Update existing users with realistic data
    for (const user of allUsers) {
      await client.query(
        `
        UPDATE users 
        SET 
          username = $1,
          current_tier = $2,
          b3tr_balance = $3,
          total_carbon_saved = $4,
          total_mileage = $5,
          total_points = $6,
          updated_at = NOW()
        WHERE id = $7
      `,
        [
          user.name,
          user.tier,
          user.totalRewards,
          user.totalCarbonSaved,
          user.totalMiles,
          user.points,
          user.id,
        ]
      );
    }

    console.log("✅ Updated existing users with realistic data");

    // Create simple vehicles for first 8 users
    await createSimpleVehicles(client);

    // Create simple products
    await createSimpleProducts(client);

    // Create simple badges
    await createSimpleBadges(client);

    // Create simple challenges
    await createSimpleChallenges(client);

    // Create simple notifications
    await createSimpleNotifications(client);

    // Create simple rewards
    await createSimpleRewards(client);

    console.log("🎉 Simplified database population completed successfully!");
  } catch (error) {
    console.error("❌ Error populating database:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function createSimpleVehicles(client) {
  const vehicleTypes = [
    "Tesla Model 3",
    "Nissan Leaf",
    "Chevrolet Bolt",
    "BMW i3",
    "Audi e-tron",
  ];

  for (const user of allUsers.slice(0, 8)) {
    const vehicleType =
      vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const make = vehicleType.split(" ")[0];
    const model = vehicleType.split(" ").slice(1).join(" ");

    await client.query(
      `
      INSERT INTO vehicles (
        id, user_id, make, model, "vehicleType", fuel_type, plate_number, 
        is_primary, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW()
      )
    `,
      [
        user.id,
        make,
        model,
        "car",
        "electric",
        `ABC${Math.floor(Math.random() * 999)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      ]
    );
  }

  console.log("✅ Created simple vehicles for users");
}

async function createSimpleProducts(client) {
  const products = [
    {
      name: "Eco-Friendly Water Bottle",
      description: "Reusable stainless steel water bottle",
      price: 25.0,
      category: "home",
      stock: 100,
    },
    {
      name: "Solar Phone Charger",
      description: "Portable solar charger for mobile devices",
      price: 45.0,
      category: "electronics",
      stock: 50,
    },
    {
      name: "Bamboo Toothbrush Set",
      description: "Pack of 4 biodegradable bamboo toothbrushes",
      price: 15.0,
      category: "home",
      stock: 200,
    },
  ];

  for (const product of products) {
    await client.query(
      `
      INSERT INTO products (
        id, name, description, price, category, "stockQuantity", status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, 'active', NOW(), NOW()
      )
    `,
      [
        product.name,
        product.description,
        product.price,
        product.category,
        product.stock,
      ]
    );
  }

  console.log("✅ Created simple products");
}

async function createSimpleBadges(client) {
  const badges = [
    {
      name: "First Mile",
      description: "Complete your first EV mile",
      rarity: "common",
      conditions: JSON.stringify({ miles: 1 }),
      rewards: JSON.stringify({ b3tr: 10 }),
      is_published: true,
    },
    {
      name: "Carbon Warrior",
      description: "Save 100kg of CO2",
      rarity: "rare",
      conditions: JSON.stringify({ carbonSaved: 100 }),
      rewards: JSON.stringify({ b3tr: 50 }),
      is_published: true,
    },
    {
      name: "Mileage Champion",
      description: "Drive 1000 EV miles",
      rarity: "legendary",
      conditions: JSON.stringify({ miles: 1000 }),
      rewards: JSON.stringify({ b3tr: 200 }),
      is_published: true,
    },
  ];

  for (const badge of badges) {
    await client.query(
      `
      INSERT INTO badges (
        id, name, description, rarity, conditions, rewards, status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
      )
    `,
      [
        badge.name,
        badge.description,
        badge.rarity,
        badge.conditions,
        badge.rewards,
        "active",
      ]
    );
  }

  console.log("✅ Created simple badges");
}

async function createSimpleChallenges(client) {
  const challenges = [
    {
      name: "Weekly Warrior",
      description: "Drive 100 miles this week",
      type: "mileage",
      difficulty: "easy",
      objective: JSON.stringify({ mileage: 100 }),
      rewards: JSON.stringify({ b3trTokens: 75 }),
      is_published: true,
    },
    {
      name: "Carbon Crusher",
      description: "Save 50kg of CO2 this month",
      type: "carbon_saved",
      difficulty: "medium",
      objective: JSON.stringify({ carbonSaved: 50 }),
      rewards: JSON.stringify({ b3trTokens: 150 }),
      is_published: true,
    },
  ];

  for (const challenge of challenges) {
    await client.query(
      `
      INSERT INTO challenges (
        id, name, description, type, difficulty, objectives, rewards, status, "startDate", "endDate", created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
    `,
      [
        challenge.name,
        challenge.description,
        challenge.type,
        challenge.difficulty,
        challenge.objective,
        challenge.rewards,
        "active",
        new Date().toISOString().split("T")[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      ]
    );
  }

  console.log("✅ Created simple challenges");
}

async function createSimpleNotifications(client) {
  for (const user of allUsers.slice(0, 6)) {
    await client.query(
      `
      INSERT INTO notifications (
        id, user_id, title, message, type, "isRead", created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()
      )
    `,
      [
        user.id,
        `Welcome ${user.name}!`,
        `Welcome to ByteMe AI Drive & Earn platform!`,
        "welcome",
        false,
      ]
    );
  }

  console.log("✅ Created simple notifications");
}

async function createSimpleRewards(client) {
  for (const user of allUsers.slice(0, 6)) {
    await client.query(
      `
      INSERT INTO rewards (
        id, user_id, type, amount, "milesDriven", "carbonSaved", status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
      )
    `,
      [
        user.id,
        "upload",
        Math.floor(Math.random() * 50) + 5,
        Math.floor(Math.random() * 100) + 10,
        Math.floor(Math.random() * 20) + 5,
        "completed",
      ]
    );
  }

  console.log("✅ Created simple rewards");
}

// Run the population script
populateDatabase()
  .then(() => {
    console.log("🎉 Database population completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

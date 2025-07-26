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
    phone: null,
    lastLoginAt: "2025-07-26 05:17:54.714000",
    isActive: true,
    isVerified: true,
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
    phone: "054971554de3f7404839a85e620203ec",
    lastLoginAt: null,
    isActive: true,
    isVerified: false,
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
    phone: "767913",
    lastLoginAt: null,
    isActive: true,
    isVerified: false,
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
    phone: "320432",
    lastLoginAt: null,
    isActive: true,
    isVerified: false,
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
    phone: "342440",
    lastLoginAt: "2025-07-25 16:46:50.220000",
    isActive: true,
    isVerified: true,
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
    phone: null,
    lastLoginAt: "2025-07-26 05:06:16.161000",
    isActive: true,
    isVerified: true,
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
    phone: "450569",
    lastLoginAt: null,
    isActive: true,
    isVerified: false,
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
    phone: null,
    lastLoginAt: "2025-07-25 17:09:02.225000",
    isActive: true,
    isVerified: true,
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
    phone: "75034fd819569e870d234735410a4f8f",
    lastLoginAt: null,
    isActive: true,
    isVerified: false,
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
    phone: null,
    lastLoginAt: null,
    isActive: true,
    isVerified: false,
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
    phone: null,
    lastLoginAt: null,
    isActive: true,
    isVerified: false,
    tier: "bronze",
    totalRewards: 0.0,
    totalCarbonSaved: 0.0,
    totalMiles: 0,
    points: 0,
  },
];

// Add some new users for variety
const newUsers = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Alice Johnson",
    email: "alice@example.com",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    walletType: "veworld",
    phone: "1234567890",
    lastLoginAt: new Date().toISOString(),
    isActive: true,
    isVerified: true,
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
    phone: "0987654321",
    lastLoginAt: new Date().toISOString(),
    isActive: true,
    isVerified: true,
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
    phone: "5551234567",
    lastLoginAt: new Date().toISOString(),
    isActive: true,
    isVerified: true,
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
    console.log("🚀 Starting database population...");

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

    // // Create vehicles for users
    // await createVehicles(client);

    // // Create odometer uploads
    // await createOdometerUploads(client);

    // // Create products for store
    // await createProducts(client);

    // // Create orders
    // await createOrders(client);

    // // Create badges
    // await createBadges(client);

    // Create user badges
    await createUserBadges(client);

    // // Create challenges
    // await createChallenges(client);

    // // Create user challenges
    // await createUserChallenges(client);

    // // Create notifications
    // await createNotifications(client);

    // // Create history entries
    // await createHistoryEntries(client);

    // // Create rewards
    // await createRewards(client);

    // // Update leaderboard
    // await updateLeaderboard(client);

    console.log("🎉 Database population completed successfully!");
  } catch (error) {
    console.error("❌ Error populating database:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function createVehicles(client) {
  const vehicleTypes = [
    "Tesla Model 3",
    "Nissan Leaf",
    "Chevrolet Bolt",
    "BMW i3",
    "Audi e-tron",
    "Hyundai Kona Electric",
    "Kia Niro EV",
    "Ford Mustang Mach-E",
  ];
  const fuelTypes = ["electric", "hybrid", "plug-in_hybrid"];

  for (const user of allUsers.slice(0, 8)) {
    // Give vehicles to first 8 users
    const numVehicles = Math.floor(Math.random() * 3) + 1; // 1-3 vehicles per user

    for (let i = 0; i < numVehicles; i++) {
      const vehicleType =
        vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const fuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
      const isPrimary = i === 0;

      await client.query(
        `
        INSERT INTO vehicles (
          id, user_id, make, model, "vehicleType", fuel_type, plate_number, vin, 
          battery_capacity, insurance_info, maintenance_info, 
          is_primary, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        )
      `,
        [
          user.id,
          vehicleType.split(" ")[0], // Make (first part of vehicle type)
          vehicleType.split(" ").slice(1).join(" "), // Model (rest of vehicle type)
          vehicleType.toLowerCase().includes("tesla")
            ? "car"
            : vehicleType.toLowerCase().includes("leaf")
              ? "car"
              : vehicleType.toLowerCase().includes("bolt")
                ? "car"
                : vehicleType.toLowerCase().includes("bmw")
                  ? "car"
                  : vehicleType.toLowerCase().includes("audi")
                    ? "suv"
                    : vehicleType.toLowerCase().includes("hyundai")
                      ? "suv"
                      : vehicleType.toLowerCase().includes("kia")
                        ? "suv"
                        : vehicleType.toLowerCase().includes("ford")
                          ? "suv"
                          : "car",
          fuelType,
          `ABC${Math.floor(Math.random() * 999)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          `VIN${Math.random().toString(36).substr(2, 17).toUpperCase()}`,
          Math.floor(Math.random() * 100) + 50, // 50-150 kWh
          JSON.stringify({
            provider: "Insurance Co",
            policy: `POL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          }),
          JSON.stringify({
            lastService: new Date(
              Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
            ).toISOString(),
          }),
          isPrimary,
        ]
      );
    }
  }

  console.log("✅ Created vehicles for users");
}

async function createOdometerUploads(client) {
  const users = allUsers.slice(0, 8); // First 8 users

  for (const user of users) {
    const numUploads = Math.floor(Math.random() * 10) + 5; // 5-15 uploads per user

    for (let i = 0; i < numUploads; i++) {
      const mileage = Math.floor(Math.random() * 50000) + 1000; // 1000-51000 miles
      const carbonSaved = mileage * 0.4; // 0.4 kg CO2 per mile saved
      const confidence = Math.random() * 0.3 + 0.7; // 70-100% confidence

      await client.query(
        `
        INSERT INTO odometer_uploads (
          id, user_id, s3_image_url, s3_thumbnail_url, extracted_mileage, carbon_saved, ocr_confidence_score,
          status, "validationStatus", vehicle_id, validation_notes, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8,
          (SELECT id FROM vehicles WHERE user_id = $1 LIMIT 1), 
          $9, NOW(), NOW()
        )
      `,
        [
          user.id,
          `https://example.com/odometer-images/${user.id}-${i}.jpg`,
          `https://example.com/odometer-thumbnails/${user.id}-${i}.jpg`,
          mileage,
          carbonSaved,
          confidence,
          confidence > 0.8 ? "completed" : "pending",
          confidence > 0.8 ? "approved" : "pending",
          `Upload ${i + 1} for ${user.name}`,
        ]
      );
    }
  }

  console.log("✅ Created odometer uploads");
}

async function createProducts(client) {
  const products = [
    {
      name: "Eco-Friendly Water Bottle",
      description: "Reusable stainless steel water bottle",
      price: 25.0,
      category: "lifestyle",
      stock: 100,
      image_url: "https://example.com/products/water-bottle.jpg",
    },
    {
      name: "Solar Phone Charger",
      description: "Portable solar charger for mobile devices",
      price: 45.0,
      category: "electronics",
      stock: 50,
      image_url: "https://example.com/products/solar-charger.jpg",
    },
    {
      name: "Bamboo Toothbrush Set",
      description: "Pack of 4 biodegradable bamboo toothbrushes",
      price: 15.0,
      category: "lifestyle",
      stock: 200,
      image_url: "https://example.com/products/bamboo-toothbrush.jpg",
    },
    {
      name: "LED Light Bulb Pack",
      description: "Energy-efficient LED bulbs (pack of 4)",
      price: 20.0,
      category: "home",
      stock: 75,
      image_url: "https://example.com/products/led-bulbs.jpg",
    },
    {
      name: "Organic Cotton Tote Bag",
      description: "Reusable shopping bag made from organic cotton",
      price: 12.0,
      category: "lifestyle",
      stock: 150,
      image_url: "https://example.com/products/tote-bag.jpg",
    },
  ];

  for (const product of products) {
    await client.query(
      `
        INSERT INTO products (
          id, name, description, category, price, stock_quantity, image_url,
          status, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'active', NOW(), NOW()
        )
      `,
      [
        product.name,
        product.description,
        product.category,
        product.price,
        product.stock,
        product.image_url,
      ]
    );
  }

  console.log("✅ Created products");
}

async function createOrders(client) {
  const users = allUsers.slice(0, 6); // First 6 users

  for (const user of users) {
    const numOrders = Math.floor(Math.random() * 3) + 1; // 1-3 orders per user

    for (let i = 0; i < numOrders; i++) {
      const productId = await client.query(
        "SELECT id FROM products ORDER BY RANDOM() LIMIT 1"
      );
      const quantity = Math.floor(Math.random() * 3) + 1;
      const status = ["pending", "processing", "shipped", "delivered"][
        Math.floor(Math.random() * 4)
      ];

      await client.query(
        `
        INSERT INTO orders (
          id, user_id, product_id, quantity, unit_price, total_price, status,
          shipping_address, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        )
      `,
        [
          user.id,
          productId.rows[0].id,
          quantity,
          25.0, // Unit price
          quantity * 25.0, // Total price
          status,
          JSON.stringify({
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zipCode: "12345",
            country: "USA",
          }),
        ]
      );
    }
  }

  console.log("✅ Created orders");
}

async function createBadges(client) {
  const badges = [
    {
      name: "First Mile",
      description: "Complete your first EV mile",
      type: "mileage",
      rarity: "common",
      status: "active",
      image_url: "https://example.com/badges/first-mile.png",
      icon_url: "https://example.com/badges/icons/first-mile.svg",
      conditions: JSON.stringify({ mileage: 1, timeFrame: "all_time" }),
      rewards: JSON.stringify({ b3trTokens: 10, points: 10, experience: 5 }),
      points_value: 10,
      metadata: JSON.stringify({
        category: "milestone",
        tags: ["beginner"],
        difficulty: 1,
      }),
    },
    {
      name: "Carbon Warrior",
      description: "Save 100kg of CO2",
      type: "carbon_saved",
      rarity: "rare",
      status: "active",
      image_url: "https://example.com/badges/carbon-warrior.png",
      icon_url: "https://example.com/badges/icons/carbon-warrior.svg",
      conditions: JSON.stringify({ carbonSaved: 100, timeFrame: "all_time" }),
      rewards: JSON.stringify({ b3trTokens: 75, points: 75, experience: 40 }),
      points_value: 75,
      metadata: JSON.stringify({
        category: "environmental",
        tags: ["carbon"],
        difficulty: 4,
      }),
    },
    {
      name: "Streak Master",
      description: "Upload for 7 consecutive days",
      type: "upload_streak",
      rarity: "epic",
      status: "active",
      image_url: "https://example.com/badges/streak-master.png",
      icon_url: "https://example.com/badges/icons/streak-master.svg",
      conditions: JSON.stringify({ uploadStreak: 7, timeFrame: "weekly" }),
      rewards: JSON.stringify({
        b3trTokens: 200,
        points: 200,
        experience: 100,
      }),
      points_value: 200,
      metadata: JSON.stringify({
        category: "consistency",
        tags: ["streak"],
        difficulty: 6,
      }),
    },
    {
      name: "Mileage Champion",
      description: "Drive 1000 EV miles",
      type: "mileage",
      rarity: "legendary",
      status: "active",
      image_url: "https://example.com/badges/mileage-champion.png",
      icon_url: "https://example.com/badges/icons/mileage-champion.svg",
      conditions: JSON.stringify({ mileage: 1000, timeFrame: "all_time" }),
      rewards: JSON.stringify({
        b3trTokens: 500,
        points: 500,
        experience: 200,
      }),
      points_value: 500,
      metadata: JSON.stringify({
        category: "milestone",
        tags: ["distance"],
        difficulty: 8,
      }),
    },
  ];

  for (const badge of badges) {
    await client.query(
      `
        INSERT INTO badges (
          id, name, description, type, rarity, status, image_url, icon_url,
          conditions, rewards, points_value, metadata, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        )
      `,
      [
        badge.name,
        badge.description,
        badge.type || "mileage",
        badge.rarity,
        badge.status || "active",
        badge.image_url || null,
        badge.icon_url,
        badge.conditions,
        badge.rewards,
        badge.points_value || 0,
        JSON.stringify(badge.metadata || {}),
      ]
    );
  }

  console.log("✅ Created badges");
}

async function createUserBadges(client) {
  const users = allUsers.slice(0, 6); // First 6 users
  const badgeIds = await client.query("SELECT id FROM badges");

  for (const user of users) {
    const numBadges = Math.floor(Math.random() * 3) + 1; // 1-3 badges per user

    for (let i = 0; i < numBadges; i++) {
      const badgeId = badgeIds.rows[i % badgeIds.rows.length].id;
      const rewardsClaimed = Math.random() > 0.3; // 70% chance of being claimed
      const earnedDate = new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ); // Random date within last 90 days

      await client.query(
        `
        INSERT INTO user_badges (
          id, user_id, badge_id, earned_data, rewards, rewards_claimed, claimed_at,
          notes, is_visible, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
        )
      `,
        [
          user.id,
          badgeId,
          JSON.stringify({
            mileage: Math.floor(Math.random() * 5000) + 100,
            carbonSaved: Math.floor(Math.random() * 200) + 10,
            uploadStreak: Math.floor(Math.random() * 30) + 1,
            vehicleCount: Math.floor(Math.random() * 3) + 1,
            rewardsEarned: Math.floor(Math.random() * 1000) + 50,
            challengeCompletions: Math.floor(Math.random() * 5) + 1,
          }),
          JSON.stringify({
            b3trTokens: Math.floor(Math.random() * 100) + 10,
            points: Math.floor(Math.random() * 100) + 10,
            experience: Math.floor(Math.random() * 50) + 5,
          }),
          rewardsClaimed,
          rewardsClaimed ? earnedDate : null,
          `Earned by ${user.name} for their achievements`,
          true,
          earnedDate,
        ]
      );
    }
  }

  console.log("✅ Created user badges");
}

async function createChallenges(client) {
  const challenges = [
    {
      name: "Weekly Warrior",
      description: "Drive 100 miles this week",
      type: "mileage",
      difficulty: "easy",
      objectives: JSON.stringify({ mileage: 100 }),
      rewards: JSON.stringify({ b3trTokens: 75, points: 75, experience: 40 }),
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      max_participants: 1000,
      current_participants: 0,
    },
    {
      name: "Carbon Crusher",
      description: "Save 50kg of CO2 this month",
      type: "carbon_saved",
      difficulty: "medium",
      objectives: JSON.stringify({ carbonSaved: 50 }),
      rewards: JSON.stringify({ b3trTokens: 150, points: 150, experience: 75 }),
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      max_participants: 500,
      current_participants: 0,
    },
    {
      name: "Upload Master",
      description: "Upload 10 odometer readings",
      type: "upload_streak",
      difficulty: "hard",
      objectives: JSON.stringify({ uploadCount: 10 }),
      rewards: JSON.stringify({
        b3trTokens: 200,
        points: 200,
        experience: 100,
      }),
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      max_participants: 300,
      current_participants: 0,
    },
  ];

  for (const challenge of challenges) {
    await client.query(
      `
        INSERT INTO challenges (
          id, name, description, type, difficulty, objectives, rewards,
          start_date, end_date, status, max_participants, current_participants,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        )
      `,
      [
        challenge.name,
        challenge.description,
        challenge.type,
        challenge.difficulty,
        challenge.objectives,
        challenge.rewards,
        challenge.start_date,
        challenge.end_date,
        challenge.status || "active",
        challenge.max_participants || 0,
        challenge.current_participants || 0,
      ]
    );
  }

  console.log("✅ Created challenges");
}

async function createUserChallenges(client) {
  const users = allUsers.slice(0, 6); // First 6 users
  const challengeIds = await client.query("SELECT id FROM challenges");

  for (const user of users) {
    const numChallenges = Math.floor(Math.random() * 2) + 1; // 1-2 challenges per user

    for (let i = 0; i < numChallenges; i++) {
      const challengeId = challengeIds.rows[i % challengeIds.rows.length].id;
      const progress = Math.floor(Math.random() * 100);
      const isCompleted = progress >= 100;
      const isClaimed = isCompleted && Math.random() > 0.3;

      await client.query(
        `
        INSERT INTO user_challenges (
          id, user_id, challenge_id, status, progress, rewards_claimed, claimed_at,
          completed_at, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        )
      `,
        [
          user.id,
          challengeId,
          isCompleted ? "completed" : "in_progress",
          JSON.stringify({ mileage: progress, carbonSaved: progress * 0.4 }),
          isClaimed,
          isClaimed ? new Date().toISOString() : null,
          isCompleted ? new Date().toISOString() : null,
        ]
      );
    }
  }

  console.log("✅ Created user challenges");
}

async function createNotifications(client) {
  const users = allUsers.slice(0, 8); // First 8 users
  const notificationTypes = [
    "upload_success",
    "badge_earned",
    "challenge_completed",
    "rewards_earned",
    "leaderboard_update",
    "order_placed",
    "vehicle_added",
    "system_announcement",
    "welcome",
    "milestone_reached",
  ];

  const priorities = ["low", "medium", "high", "urgent"];
  const statuses = ["unread", "read", "archived"];
  const channels = [["in_app"], ["in_app", "email"], ["in_app", "push"]];

  for (const user of users) {
    const numNotifications = Math.floor(Math.random() * 8) + 5; // 5-12 notifications per user

    for (let i = 0; i < numNotifications; i++) {
      const type =
        notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const priority =
        priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const channel = channels[Math.floor(Math.random() * channels.length)];
      const isRead = status === "read";
      const isArchived = status === "archived";
      const isDeleted = Math.random() > 0.95; // 5% chance of being deleted

      const data = {
        badgeId:
          type === "badge_earned"
            ? "badge-" + Math.floor(Math.random() * 1000)
            : undefined,
        challengeId:
          type === "challenge_completed"
            ? "challenge-" + Math.floor(Math.random() * 1000)
            : undefined,
        orderId:
          type === "order_placed"
            ? "order-" + Math.floor(Math.random() * 1000)
            : undefined,
        vehicleId:
          type === "vehicle_added"
            ? "vehicle-" + Math.floor(Math.random() * 1000)
            : undefined,
        rewardAmount:
          type === "rewards_earned"
            ? Math.floor(Math.random() * 100) + 10
            : undefined,
        rank:
          type === "leaderboard_update"
            ? Math.floor(Math.random() * 50) + 1
            : undefined,
        milestone: type === "milestone_reached" ? "1000 miles" : undefined,
        actionUrl: "/dashboard",
        imageUrl: "https://example.com/notification-icon.png",
      };

      const deliveryStatus = {
        inApp: { sent: true, deliveredAt: new Date().toISOString() },
        email:
          Math.random() > 0.5
            ? { sent: true, deliveredAt: new Date().toISOString() }
            : { sent: false },
        push:
          Math.random() > 0.7
            ? { sent: true, deliveredAt: new Date().toISOString() }
            : { sent: false },
      };

      await client.query(
        `
        INSERT INTO notifications (
          id, user_id, type, priority, status, title, message, data, channels,
          is_read, read_at, is_archived, archived_at, is_deleted, deleted_at,
          scheduled_at, sent_at, delivery_status, notes, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
        )
      `,
        [
          user.id,
          type,
          priority,
          status,
          `${type.replace(/_/g, " ").toUpperCase()} for ${user.name}`,
          `This is a ${type.replace(/_/g, " ")} notification for ${user.name}. ${i + 1} of ${numNotifications}`,
          JSON.stringify(data),
          channel,
          isRead,
          isRead ? new Date().toISOString() : null,
          isArchived,
          isArchived ? new Date().toISOString() : null,
          isDeleted,
          isDeleted ? new Date().toISOString() : null,
          Math.random() > 0.9
            ? new Date(Date.now() + 86400000).toISOString()
            : null, // 10% chance of scheduled
          Math.random() > 0.3 ? new Date().toISOString() : null, // 70% chance of sent
          JSON.stringify(deliveryStatus),
          Math.random() > 0.8 ? "Admin note: Important notification" : null,
        ]
      );
    }
  }

  console.log("✅ Created notifications");
}

async function createHistoryEntries(client) {
  const users = allUsers.slice(0, 8); // First 8 users
  const historyTypes = [
    "upload",
    "reward",
    "badge",
    "challenge",
    "order",
    "vehicle",
    "leaderboard",
  ];

  for (const user of users) {
    const numEntries = Math.floor(Math.random() * 10) + 5; // 5-15 history entries per user

    for (let i = 0; i < numEntries; i++) {
      const type =
        historyTypes[Math.floor(Math.random() * historyTypes.length)];

      await client.query(
        `
        INSERT INTO history (
          id, user_id, type, title, description, metadata,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()
        )
      `,
        [
          user.id,
          type,
          `${type.charAt(0).toUpperCase() + type.slice(1)} Activity`,
          `User performed ${type} activity`,
          JSON.stringify({
            activity: type,
            timestamp: new Date().toISOString(),
          }),
        ]
      );
    }
  }

  console.log("✅ Created history entries");
}

async function createRewards(client) {
  const users = allUsers.slice(0, 8); // First 8 users
  const rewardTypes = [
    "upload",
    "badge",
    "challenge",
    "milestone",
    "leaderboard",
    "bonus",
    "referral",
  ];

  const rewardStatuses = [
    "pending",
    "processing",
    "completed",
    "failed",
    "cancelled",
  ];
  const blockchainStatuses = ["not_sent", "sent", "confirmed", "failed"];

  for (const user of users) {
    const numRewards = Math.floor(Math.random() * 10) + 5; // 5-15 rewards per user

    for (let i = 0; i < numRewards; i++) {
      const type = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
      const amount = (Math.random() * 100 + 10).toFixed(8); // 10-110 B3TR with 8 decimal places
      const status =
        rewardStatuses[Math.floor(Math.random() * rewardStatuses.length)];
      const blockchainStatus =
        blockchainStatuses[
          Math.floor(Math.random() * blockchainStatuses.length)
        ];
      const milesDriven = Math.floor(Math.random() * 200) + 10; // 10-210 miles
      const carbonSaved = Math.floor(Math.random() * 50) + 5; // 5-55 kg CO2
      const cycleId = Math.floor(Math.random() * 1000) + 1;
      const submissionId = Math.floor(Math.random() * 10000) + 1;

      const proofData = {
        proofTypes: ["mileage", "carbon", "timestamp"],
        proofValues: ["verified", "calculated", new Date().toISOString()],
        impactCodes: ["CO2_SAVED", "MILES_DRIVEN"],
        impactValues: [carbonSaved * 1000, milesDriven], // Convert to grams
        imageHash: "0x" + Math.random().toString(16).substring(2, 66),
        uploadId: "upload-" + Math.floor(Math.random() * 10000),
        badgeId:
          type === "badge"
            ? "badge-" + Math.floor(Math.random() * 1000)
            : undefined,
        challengeId:
          type === "challenge"
            ? "challenge-" + Math.floor(Math.random() * 1000)
            : undefined,
        milestoneType: type === "milestone" ? "1000_miles" : undefined,
        leaderboardPeriod: type === "leaderboard" ? "weekly" : undefined,
        leaderboardRank:
          type === "leaderboard"
            ? Math.floor(Math.random() * 50) + 1
            : undefined,
      };

      const blockchainData = {
        txHash:
          blockchainStatus !== "not_sent"
            ? "0x" + Math.random().toString(16).substring(2, 66)
            : undefined,
        blockNumber:
          blockchainStatus === "confirmed"
            ? Math.floor(Math.random() * 1000000) + 1
            : undefined,
        gasUsed:
          blockchainStatus !== "not_sent"
            ? Math.floor(Math.random() * 100000) + 21000
            : undefined,
        gasPrice:
          blockchainStatus !== "not_sent"
            ? (Math.random() * 50 + 20).toFixed(9)
            : undefined,
        nonce:
          blockchainStatus !== "not_sent"
            ? Math.floor(Math.random() * 1000)
            : undefined,
        error: blockchainStatus === "failed" ? "Transaction failed" : undefined,
        retryCount:
          blockchainStatus === "failed" ? Math.floor(Math.random() * 3) : 0,
        lastRetryAt:
          blockchainStatus === "failed" ? new Date().toISOString() : undefined,
        sentAt:
          blockchainStatus !== "not_sent"
            ? new Date().toISOString()
            : undefined,
      };

      const metadata = {
        source: type,
        trigger: "automatic",
        batchId: "batch-" + Math.floor(Math.random() * 1000),
        batchIndex: i,
        previousBalance: (Math.random() * 1000).toFixed(8),
        newBalance: (Math.random() * 2000).toFixed(8),
        tier: ["bronze", "silver", "gold", "platinum"][
          Math.floor(Math.random() * 4)
        ],
        multiplier: Math.random() * 2 + 1,
        bonus: Math.random() * 10,
      };

      const processedAt =
        status !== "pending" ? new Date().toISOString() : null;
      const confirmedAt =
        blockchainStatus === "confirmed" ? new Date().toISOString() : null;
      const failedAt = status === "failed" ? new Date().toISOString() : null;
      const failureReason =
        status === "failed" ? "Blockchain transaction failed" : null;

      await client.query(
        `
        INSERT INTO rewards (
          id, user_id, type, status, blockchain_status, amount, miles_driven, carbon_saved,
          cycle_id, submission_id, description, proof_data, blockchain_data, metadata,
          processed_at, confirmed_at, failed_at, failure_reason, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW()
        )
      `,
        [
          user.id,
          type,
          status,
          blockchainStatus,
          amount,
          milesDriven,
          carbonSaved,
          cycleId,
          submissionId,
          `Reward for ${type} activity - ${milesDriven} miles driven, ${carbonSaved}kg CO2 saved`,
          JSON.stringify(proofData),
          JSON.stringify(blockchainData),
          JSON.stringify(metadata),
          processedAt,
          confirmedAt,
          failedAt,
          failureReason,
        ]
      );
    }
  }

  console.log("✅ Created rewards");
}

async function updateLeaderboard(client) {
  // Update leaderboard entries for all users
  const periods = ["daily", "weekly", "monthly", "all_time"];

  for (const user of allUsers) {
    for (const period of periods) {
      const totalMileage = Math.floor(Math.random() * 5000) + 100; // 100-5100 miles
      const totalCarbonSaved = Math.floor(Math.random() * 1000) + 50; // 50-1050 kg CO2
      const totalRewards = (Math.random() * 500 + 10).toFixed(6); // 10-510 B3TR
      const totalPoints = Math.floor(Math.random() * 10000) + 100; // 100-10100 points
      const uploadCount = Math.floor(Math.random() * 100) + 5; // 5-105 uploads
      const rank = Math.floor(Math.random() * 100) + 1; // 1-100 rank

      // Calculate period dates
      const now = new Date();
      let periodStart, periodEnd;

      switch (period) {
        case "daily":
          periodStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          periodEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );
          break;
        case "weekly":
          const dayOfWeek = now.getDay();
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          periodStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - daysToMonday
          );
          periodEnd = new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "monthly":
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case "all_time":
          periodStart = new Date(2024, 0, 1); // Start of 2024
          periodEnd = new Date(now.getFullYear() + 1, 0, 1); // End of next year
          break;
      }

      await client.query(
        `
        INSERT INTO leaderboard (
          id, user_id, period, total_mileage, total_carbon_saved, total_rewards, total_points,
          upload_count, rank, period_start, period_end, is_active, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
        )
        ON CONFLICT (user_id, period) DO UPDATE SET
          total_mileage = $3,
          total_carbon_saved = $4,
          total_rewards = $5,
          total_points = $6,
          upload_count = $7,
          rank = $8,
          period_start = $9,
          period_end = $10,
          is_active = $11,
          updated_at = NOW()
      `,
        [
          user.id,
          period,
          totalMileage,
          totalCarbonSaved,
          totalRewards,
          totalPoints,
          uploadCount,
          rank,
          periodStart,
          periodEnd,
          true,
        ]
      );
    }
  }

  console.log("✅ Updated leaderboard");
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

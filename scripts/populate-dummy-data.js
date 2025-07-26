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

    // Create vehicles for users
    await createVehicles(client);

    // Create odometer uploads
    await createOdometerUploads(client);

    // Create products for store
    await createProducts(client);

    // Create orders
    await createOrders(client);

    // Create badges
    await createBadges(client);

    // Create user badges
    await createUserBadges(client);

    // Create challenges
    await createChallenges(client);

    // Create user challenges
    await createUserChallenges(client);

    // Create notifications
    await createNotifications(client);

    // Create history entries
    await createHistoryEntries(client);

    // Create rewards
    await createRewards(client);

    // Update leaderboard
    await updateLeaderboard(client);

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
        id, name, description, price, category, stock, image_url,
        is_active, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW()
      )
    `,
      [
        product.name,
        product.description,
        product.price,
        product.category,
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
          id, user_id, product_id, quantity, total_amount, status,
          shipping_address, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
        )
      `,
        [
          user.id,
          productId.rows[0].id,
          quantity,
          quantity * 25.0, // Assuming $25 per product
          status,
          JSON.stringify({
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zip: "12345",
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
      icon_url: "https://example.com/badges/first-mile.png",
      rarity: "common",
      conditions: JSON.stringify({ miles: 1 }),
      rewards: JSON.stringify({ b3tr: 10 }),
      is_published: true,
    },
    {
      name: "Carbon Warrior",
      description: "Save 100kg of CO2",
      icon_url: "https://example.com/badges/carbon-warrior.png",
      rarity: "rare",
      conditions: JSON.stringify({ carbonSaved: 100 }),
      rewards: JSON.stringify({ b3tr: 50 }),
      is_published: true,
    },
    {
      name: "Streak Master",
      description: "Upload for 7 consecutive days",
      icon_url: "https://example.com/badges/streak-master.png",
      rarity: "epic",
      conditions: JSON.stringify({ streak: 7 }),
      rewards: JSON.stringify({ b3tr: 100 }),
      is_published: true,
    },
    {
      name: "Mileage Champion",
      description: "Drive 1000 EV miles",
      icon_url: "https://example.com/badges/mileage-champion.png",
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
        id, name, description, icon_url, rarity, conditions, rewards,
        is_published, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      )
    `,
      [
        badge.name,
        badge.description,
        badge.icon_url,
        badge.rarity,
        badge.conditions,
        badge.rewards,
        badge.is_published,
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
      const isClaimed = Math.random() > 0.3; // 70% chance of being claimed

      await client.query(
        `
        INSERT INTO user_badges (
          id, user_id, badge_id, earned_at, is_claimed, claimed_at,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, NOW(), $3, $4, NOW(), NOW()
        )
      `,
        [
          user.id,
          badgeId,
          isClaimed,
          isClaimed ? new Date().toISOString() : null,
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
      type: "weekly",
      difficulty: "easy",
      objective: JSON.stringify({ miles: 100 }),
      rewards: JSON.stringify({ b3tr: 75 }),
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_published: true,
    },
    {
      name: "Carbon Crusher",
      description: "Save 50kg of CO2 this month",
      type: "monthly",
      difficulty: "medium",
      objective: JSON.stringify({ carbonSaved: 50 }),
      rewards: JSON.stringify({ b3tr: 150 }),
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_published: true,
    },
    {
      name: "Upload Master",
      description: "Upload 10 odometer readings",
      type: "achievement",
      difficulty: "hard",
      objective: JSON.stringify({ uploads: 10 }),
      rewards: JSON.stringify({ b3tr: 200 }),
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      is_published: true,
    },
  ];

  for (const challenge of challenges) {
    await client.query(
      `
      INSERT INTO challenges (
        id, name, description, type, difficulty, objective, rewards,
        start_date, end_date, is_published, created_at, updated_at
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
        challenge.start_date,
        challenge.end_date,
        challenge.is_published,
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
          id, user_id, challenge_id, progress, is_completed, is_claimed,
          completed_at, claimed_at, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
        )
      `,
        [
          user.id,
          challengeId,
          progress,
          isCompleted,
          isClaimed,
          isCompleted ? new Date().toISOString() : null,
          isClaimed ? new Date().toISOString() : null,
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
    "reward_received",
    "system_update",
  ];

  for (const user of users) {
    const numNotifications = Math.floor(Math.random() * 5) + 3; // 3-7 notifications per user

    for (let i = 0; i < numNotifications; i++) {
      const type =
        notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const isRead = Math.random() > 0.4; // 60% chance of being read

      await client.query(
        `
        INSERT INTO notifications (
          id, user_id, title, message, type, is_read, read_at,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
        )
      `,
        [
          user.id,
          `Notification ${i + 1} for ${user.name}`,
          `This is a ${type} notification for ${user.name}`,
          type,
          isRead,
          isRead ? new Date().toISOString() : null,
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
    "mileage",
    "carbon_saved",
    "badge",
    "challenge",
    "streak",
  ];

  for (const user of users) {
    const numRewards = Math.floor(Math.random() * 8) + 3; // 3-10 rewards per user

    for (let i = 0; i < numRewards; i++) {
      const type = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
      const amount = Math.floor(Math.random() * 50) + 5; // 5-55 B3TR
      const status = ["pending", "processing", "completed", "failed"][
        Math.floor(Math.random() * 4)
      ];

      await client.query(
        `
        INSERT INTO rewards (
          id, user_id, type, amount, miles_driven, carbon_saved,
          status, blockchain_status, proof_data, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        )
      `,
        [
          user.id,
          type,
          amount,
          Math.floor(Math.random() * 100) + 10, // 10-110 miles
          Math.floor(Math.random() * 20) + 5, // 5-25 kg CO2
          status,
          status === "completed" ? "confirmed" : "pending",
          JSON.stringify({ type: type, timestamp: new Date().toISOString() }),
        ]
      );
    }
  }

  console.log("✅ Created rewards");
}

async function updateLeaderboard(client) {
  // Update leaderboard entries for all users
  for (const user of allUsers) {
    await client.query(
      `
      INSERT INTO leaderboard (
        id, user_id, total_miles, total_carbon_saved, total_rewards, points,
        rank, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        total_miles = $2,
        total_carbon_saved = $3,
        total_rewards = $4,
        points = $5,
        updated_at = NOW()
    `,
      [
        user.id,
        user.totalMiles,
        user.totalCarbonSaved,
        user.totalRewards,
        user.points,
        Math.floor(Math.random() * 100) + 1,
      ]
    );
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

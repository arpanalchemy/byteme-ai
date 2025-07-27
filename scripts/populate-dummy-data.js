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

// Global variable to store created users
let allUsers = [];

// Function to create users
async function fetchUsers(client) {
  console.log("👥 Fetching existing users...");

  const result = await client.query(
    `
      SELECT id, username, email, wallet_address, wallet_type, nonce, email_otp, 
             last_login, is_active, is_verified, profile_image_url, total_mileage, 
             total_carbon_saved, total_points, current_tier, b3tr_balance, 
             created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `
  );

  allUsers.push(...result.rows);
  console.log(`✅ Fetched ${allUsers.length} existing users`);
}

async function populateDatabase() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting database population...");

    // Create users first
    await fetchUsers(client);

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
    // await createUserBadges(client);

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
    await updateLeaderboard(client);

    // // Create user wallets
    // await createUserWallets(client);

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
          id, user_id, make, model, vehicle_type, fuel_type, plate_number, vin, 
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
      const status = confidence > 0.8 ? "completed" : "pending";
      const validationStatus = confidence > 0.8 ? "approved" : "pending";

      // Get a random vehicle for this user
      const vehicleResult = await client.query(
        `SELECT id FROM vehicles WHERE user_id = $1 ORDER BY RANDOM() LIMIT 1`,
        [user.id]
      );
      const vehicleId =
        vehicleResult.rows.length > 0 ? vehicleResult.rows[0].id : null;

      await client.query(
        `
        INSERT INTO odometer_uploads (
          id, user_id, s3_image_url, s3_thumbnail_url, extracted_mileage, carbon_saved, ocr_confidence_score,
          status, validation_status, vehicle_id, validation_notes, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        )
      `,
        [
          user.id,
          `https://example.com/odometer-images/${user.id}-${i}.jpg`,
          `https://example.com/odometer-thumbnails/${user.id}-${i}.jpg`,
          mileage,
          carbonSaved,
          confidence,
          status,
          validationStatus,
          vehicleId,
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
      category: "clothing",
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
      category: "clothing",
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
      category: "clothing",
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
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
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
          `Earned by ${user.username || user.name} for their achievements`,
          true,
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
    "vehicle_upload",
    "reward_earned",
    "badge_earned",
    "challenge_completed",
    "order_placed",
    "vehicle_added",
    "leaderboard_rank",
    "milestone_reached",
  ];

  const historyCategories = [
    "upload",
    "rewards",
    "achievements",
    "challenges",
    "orders",
    "vehicles",
    "leaderboard",
    "system",
  ];

  for (const user of users) {
    const numEntries = Math.floor(Math.random() * 10) + 5; // 5-15 history entries per user

    for (let i = 0; i < numEntries; i++) {
      const type =
        historyTypes[Math.floor(Math.random() * historyTypes.length)];
      const category =
        historyCategories[Math.floor(Math.random() * historyCategories.length)];
      const value = Math.floor(Math.random() * 1000) + 10;
      const previousValue = Math.floor(Math.random() * 1000) + 5;

      const data = {
        activity: type,
        timestamp: new Date().toISOString(),
        userId: user.id,
        value: value,
        previousValue: previousValue,
      };

      await client.query(
        `
        INSERT INTO history (
          id, user_id, type, category, title, description, data, value, previous_value,
          is_visible, is_deleted, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        )
      `,
        [
          user.id,
          type,
          category,
          `${type.replace(/_/g, " ").toUpperCase()} for ${user.username}`,
          `User performed ${type.replace(/_/g, " ")} activity`,
          JSON.stringify(data),
          value,
          previousValue,
          true, // is_visible
          false, // is_deleted
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

async function createUserWallets(client) {
  const users = allUsers.slice(0, 10); // First 10 users
  const walletTypes = [
    "sync2",
    "veworld",
    "metamask",
    "trust_wallet",
    "coinbase_wallet",
  ];

  for (const user of users) {
    const hasWallet = Math.random() > 0.3; // 70% chance of having a wallet
    const walletType =
      walletTypes[Math.floor(Math.random() * walletTypes.length)];
    const isBackedUp = Math.random() > 0.4; // 60% chance of being backed up

    // Generate wallet address if user has wallet
    const walletAddress = hasWallet
      ? "0x" + Math.random().toString(16).substring(2, 42)
      : null;

    // Generate encrypted data if wallet exists
    const encryptedMnemonic = hasWallet
      ? "encrypted_mnemonic_" + Math.random().toString(36).substring(2)
      : null;
    const encryptedPrivateKey = hasWallet
      ? "encrypted_private_key_" + Math.random().toString(36).substring(2)
      : null;
    const encryptedPublicKey = hasWallet
      ? "encrypted_public_key_" + Math.random().toString(36).substring(2)
      : null;

    // Generate IV and salt values
    const mnemonicIv = hasWallet
      ? "iv_" + Math.random().toString(36).substring(2, 18)
      : null;
    const mnemonicSalt = hasWallet
      ? "salt_" + Math.random().toString(36).substring(2, 18)
      : null;
    const privateKeyIv = hasWallet
      ? "iv_" + Math.random().toString(36).substring(2, 18)
      : null;
    const privateKeySalt = hasWallet
      ? "salt_" + Math.random().toString(36).substring(2, 18)
      : null;
    const publicKeyIv = hasWallet
      ? "iv_" + Math.random().toString(36).substring(2, 18)
      : null;
    const publicKeySalt = hasWallet
      ? "salt_" + Math.random().toString(36).substring(2, 18)
      : null;

    await client.query(
      `
      INSERT INTO user_wallets (
        id, user_id, encrypted_mnemonic, encrypted_private_key, encrypted_public_key,
        wallet_address, wallet_type, mnemonic_iv, mnemonic_salt, private_key_iv,
        private_key_salt, public_key_iv, public_key_salt, is_backed_up, backed_up_at,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        encrypted_mnemonic = $2,
        encrypted_private_key = $3,
        encrypted_public_key = $4,
        wallet_address = $5,
        wallet_type = $6,
        mnemonic_iv = $7,
        mnemonic_salt = $8,
        private_key_iv = $9,
        private_key_salt = $10,
        public_key_iv = $11,
        public_key_salt = $12,
        is_backed_up = $13,
        backed_up_at = $14,
        updated_at = NOW()
    `,
      [
        user.id,
        encryptedMnemonic,
        encryptedPrivateKey,
        encryptedPublicKey,
        walletAddress,
        walletType,
        mnemonicIv,
        mnemonicSalt,
        privateKeyIv,
        privateKeySalt,
        publicKeyIv,
        publicKeySalt,
        isBackedUp,
        isBackedUp ? new Date().toISOString() : null,
      ]
    );
  }

  console.log("✅ Created user wallets");
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

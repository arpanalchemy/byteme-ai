const { Client } = require("pg");

async function addCustomNameToVehicles() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "drive_earn",
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Check if custom_name column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' 
      AND column_name = 'custom_name';
    `;

    const columnExists = await client.query(checkColumnQuery);

    if (columnExists.rows.length > 0) {
      console.log("custom_name column already exists in vehicles table");
      return;
    }

    // Add custom_name column
    const addColumnQuery = `
      ALTER TABLE vehicles 
      ADD COLUMN custom_name VARCHAR(255);
    `;

    await client.query(addColumnQuery);
    console.log("Successfully added custom_name column to vehicles table");

    // Add index for better performance
    const addIndexQuery = `
      CREATE INDEX idx_vehicles_custom_name 
      ON vehicles(custom_name) 
      WHERE custom_name IS NOT NULL;
    `;

    await client.query(addIndexQuery);
    console.log("Successfully added index on custom_name column");
  } catch (error) {
    console.error("Error adding custom_name column:", error);
    throw error;
  } finally {
    await client.end();
    console.log("Database connection closed");
  }
}

// Run the migration
if (require.main === module) {
  addCustomNameToVehicles()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { addCustomNameToVehicles };

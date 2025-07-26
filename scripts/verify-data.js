const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'byte-me-instance-1.c1yc40cskc5f.ca-central-1.rds.amazonaws.com',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'byteme-ai',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'i!m%GpJ;x$8$vx&',
});

async function verifyData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying populated data...\n');
    
    // Check users
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users: ${usersResult.rows[0].count}`);
    
    // Check vehicles
    const vehiclesResult = await client.query('SELECT COUNT(*) as count FROM vehicles');
    console.log(`🚗 Vehicles: ${vehiclesResult.rows[0].count}`);
    
    // Check products
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products');
    console.log(`🛍️ Products: ${productsResult.rows[0].count}`);
    
    // Check badges
    const badgesResult = await client.query('SELECT COUNT(*) as count FROM badges');
    console.log(`🏆 Badges: ${badgesResult.rows[0].count}`);
    
    // Check challenges
    const challengesResult = await client.query('SELECT COUNT(*) as count FROM challenges');
    console.log(`🎯 Challenges: ${challengesResult.rows[0].count}`);
    
    // Check notifications
    const notificationsResult = await client.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`📢 Notifications: ${notificationsResult.rows[0].count}`);
    
    // Check rewards
    const rewardsResult = await client.query('SELECT COUNT(*) as count FROM rewards');
    console.log(`💰 Rewards: ${rewardsResult.rows[0].count}`);
    
    console.log('\n✅ Data verification completed!');
    
    // Show some sample data
    console.log('\n📊 Sample Data:');
    
    const sampleUsers = await client.query('SELECT username, current_tier, b3tr_balance FROM users LIMIT 3');
    console.log('\n👥 Sample Users:');
    sampleUsers.rows.forEach(user => {
      console.log(`  - ${user.username} (${user.current_tier}): ${user.b3tr_balance} B3TR`);
    });
    
    const sampleVehicles = await client.query('SELECT make, model, "vehicleType" FROM vehicles LIMIT 3');
    console.log('\n🚗 Sample Vehicles:');
    sampleVehicles.rows.forEach(vehicle => {
      console.log(`  - ${vehicle.make} ${vehicle.model} (${vehicle.vehicleType})`);
    });
    
    const sampleProducts = await client.query('SELECT name, price, category FROM products LIMIT 3');
    console.log('\n🛍️ Sample Products:');
    sampleProducts.rows.forEach(product => {
      console.log(`  - ${product.name}: ${product.price} B3TR (${product.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    client.release();
  }
}

verifyData()
  .then(() => {
    console.log('\n🎉 Verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 
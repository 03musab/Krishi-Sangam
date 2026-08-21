require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { getDb } = require('../db');

async function test() {
  console.log('Testing smart matching DB queries...');
  const db = getDb();

  // 1. Check equipment listings
  const equip = await db.prepare('SELECT COUNT(*) as count FROM equipment_listings').get();
  console.log('Approved equipment listings:', equip.count);

  // 2. Check labour listings
  const labour = await db.prepare('SELECT COUNT(*) as count FROM labour_services').get();
  console.log('Approved labour listings:', labour.count);

  // 3. Check service bookings
  const bookings = await db.prepare('SELECT COUNT(*) as count FROM service_bookings').get();
  console.log('Total service bookings:', bookings.count);

  // 4. Check provider availability table
  const avail = await db.prepare('SELECT COUNT(*) as count FROM provider_availability').get();
  console.log('Provider availability records:', avail.count);

  // 5. Check reviews table
  const rev = await db.prepare('SELECT COUNT(*) as count FROM reviews').get();
  console.log('Total reviews:', rev.count);

  console.log('✅ All tables verified successfully!');
  process.exit(0);
}

test().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

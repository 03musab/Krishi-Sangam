/* ═══════════════════════════════════════════
   KrishiSetu — server/seed.js
   Seeds 2-3 approved sample listings per category
   (idempotent: only inserts when tables are empty)
   Usage: node seed.js   (requires DATABASE_URL in server/.env)
   ═══════════════════════════════════════════ */

require('dotenv').config();
const { getDb } = require('./db');

const db = getDb();

async function countRows(table) {
  const row = await db.prepare(`SELECT COUNT(*) c FROM ${table}`).get();
  return Number(row.c);
}

async function getOrCreateDemoUser(username, role, extra = {}) {
  const existing = await db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return existing.id;
  const email = `${username}@demo.in`;
  const info = await db.prepare(
    `INSERT INTO users (username, email, password_hash, role, phone, location, state, district, village, taluka, skills, bio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    username, email, 'demo-hash', role,
    extra.phone || '', extra.location || 'Nashik, Maharashtra',
    extra.state || 'Maharashtra', extra.district || 'Nashik',
    extra.village || '', extra.taluka || '',
    extra.skills || '', extra.bio || ''
  );
  return info.lastInsertRowid;
}

async function seedLand() {
  const approved = await db.prepare("SELECT COUNT(*) c FROM land_listings WHERE status = 'approved'").get();
  if (approved.c > 0) {
    console.log('land_listings: already has approved data, skipping');
    return;
  }
  const owner1 = await getOrCreateDemoUser('demo_landowner_ravi', 'owner', { phone: '9811112222', location: 'Nashik, Maharashtra', district: 'Nashik' });
  const owner2 = await getOrCreateDemoUser('demo_landowner_priya', 'owner', { phone: '9822223333', location: 'Pune, Maharashtra', district: 'Pune' });

  const insert = db.prepare(`
    INSERT INTO land_listings
      (owner_id, title, description, area_acres, lease_type, price_per_season, price_per_month, price_per_year,
       location, district, state, soil_type, water_source, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
  `);

  await insert.run(owner1, '5 Acre Irrigated Farm in Nashik',
    'Well-irrigated fertile farmland near Sinnar, ideal for sugarcane, onion or vegetables. Borewell with drip irrigation, 2 km from main road.',
    5, 'Per Season', 40000, null, 120000,
    'Sinnar, Nashik', 'Nashik', 'Maharashtra', 'Black Soil', 'Borewell');
  await insert.run(owner1, '8 Acre Grape Farm near Nashik',
    'Established grape vineyard with drip irrigation, godown and labour quarters. Perfect for table grapes and wine varieties.',
    8, 'Per Year', null, null, 280000,
    'Dindori, Nashik', 'Nashik', 'Maharashtra', 'Loamy Soil', 'Canal');
  await insert.run(owner2, '3 Acre Organic Farmland in Pune',
    'Certified organic-friendly plot near Baramati. River water access, fencing provided, suitable for vegetables and horticulture.',
    3, 'Per Season', 25000, null, 75000,
    'Baramati, Pune', 'Pune', 'Maharashtra', 'Alluvial Soil', 'River');

  console.log('seeded land_listings: 3');
}

async function seedEquipment() {
  if (await countRows('equipment_listings') > 0) {
    console.log('equipment_listings: already has data, skipping');
    return;
  }
  const owner1 = await getOrCreateDemoUser('demo_equipowner_suresh', 'owner', { phone: '9833334444', location: 'Latur, Maharashtra', district: 'Latur' });
  const owner2 = await getOrCreateDemoUser('demo_equipowner_anil', 'owner', { phone: '9844445555', location: 'Kolhapur, Maharashtra', district: 'Kolhapur' });

  const insert = db.prepare(`
    INSERT INTO equipment_listings
      (owner_id, name, type, description, price_per_hour, price_per_day, deposit, location, district, state, with_operator, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
  `);

  await insert.run(owner1, 'Mahindra 575 Tractor', 'Tractor',
    '75 HP tractor with rotavator attachment, well maintained, available with operator on request.',
    700, 4500, 15000, 'Latur, Maharashtra', 'Latur', 'Maharashtra', 1);
  await insert.run(owner1, 'John Deere Harvester', 'Harvester',
    'Self-propelled combine harvester for wheat, soybean and paddy. Full crew included.',
    3500, 20000, 50000, 'Latur, Maharashtra', 'Latur', 'Maharashtra', 1);
  await insert.run(owner2, 'Swaraj 744 FE Tractor', 'Tractor',
    '50 HP tractor with trolley, perfect for small and mid-size farms. Diesel included.',
    500, 3500, 12000, 'Kolhapur, Maharashtra', 'Kolhapur', 'Maharashtra', 0);
  await insert.run(owner2, 'Power Sprayer 500L', 'Sprayer',
    'Tractor-mounted 500 litre power sprayer for pesticide and fertilizer application.',
    400, 2500, 5000, 'Kolhapur, Maharashtra', 'Kolhapur', 'Maharashtra', 1);

  console.log('seeded equipment_listings: 4');
}

async function seedLabour() {
  if (await countRows('labour_services') > 0) {
    console.log('labour_services: already has data, skipping');
    return;
  }
  const w1 = await getOrCreateDemoUser('demo_worker_mahesh', 'labourer', {
    phone: '9855556666', location: 'Nanded, Maharashtra', district: 'Nanded',
    skills: 'plowing, harvesting, irrigation'
  });
  const w2 = await getOrCreateDemoUser('demo_worker_sunita', 'labourer', {
    phone: '9866667777', location: 'Beed, Maharashtra', district: 'Beed',
    skills: 'sowing, weeding, harvesting'
  });

  const insert = db.prepare(`
    INSERT INTO labour_services
      (worker_id, title, description, skills, experience_years, daily_rate, location, district, state, availability, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'approved')
  `);

  await insert.run(w1, 'Experienced Farm Worker — All Field Operations',
    '8 years of experience in plowing, sowing, irrigation and harvesting. Can operate basic machinery.',
    'plowing, harvesting, irrigation', 8, 800, 'Nanded, Maharashtra', 'Nanded', 'Maharashtra');
  await insert.run(w1, 'Irrigation & Drip Line Specialist',
    'Expert in setting up drip and sprinkler irrigation systems. Also handles canal and borewell maintenance.',
    'irrigation, drip line, sprinkler', 6, 900, 'Nanded, Maharashtra', 'Nanded', 'Maharashtra');
  await insert.run(w2, 'Seasonal Harvesting Crew Member',
    'Part of a reliable harvesting team for paddy, wheat and pulses. Available for group bookings.',
    'sowing, weeding, harvesting', 5, 350, 'Beed, Maharashtra', 'Beed', 'Maharashtra');

  console.log('seeded labour_services: 3');
}

async function seedProduce() {
  if (await countRows('produce_listings') > 0) {
    console.log('produce_listings: already has data, skipping');
    return;
  }
  const s1 = await getOrCreateDemoUser('demo_farmer_kiran', 'farmer', { phone: '9877778888', location: 'Nagpur, Maharashtra', district: 'Nagpur' });
  const s2 = await getOrCreateDemoUser('demo_farmer_asha', 'farmer', { phone: '9888889999', location: 'Amravati, Maharashtra', district: 'Amravati' });

  const insert = db.prepare(`
    INSERT INTO produce_listings
      (seller_id, crop_name, description, quantity, unit, price_per_unit, location, district, state, quality_grade, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
  `);

  await insert.run(s1, 'Nagpur Oranges',
    'Fresh, juicy Nagpur oranges from certified orchard. Ideal for juice and direct retail.',
    500, 'kg', 45, 'Nagpur, Maharashtra', 'Nagpur', 'Maharashtra', 'A');
  await insert.run(s1, 'Soybean (Black)', 'High-protein black soybean, freshly harvested and sun-dried.', 40, 'quintal', 4800, 'Nagpur, Maharashtra', 'Nagpur', 'Maharashtra', 'A');
  await insert.run(s2, 'Fresh Tomatoes',
    'Farm-fresh red tomatoes from greenhouse, ready for market or processing.',
    300, 'kg', 25, 'Amravati, Maharashtra', 'Amravati', 'Maharashtra', 'A');
  await insert.run(s2, 'Cotton (Kapas)', 'Clean, well-ginned cotton kapas from the season.', 25, 'quintal', 7500, 'Amravati, Maharashtra', 'Amravati', 'Maharashtra', 'B');

  console.log('seeded produce_listings: 4');
}

async function main() {
  try {
    await seedLand();
    await seedEquipment();
    await seedLabour();
    await seedProduce();
    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main();

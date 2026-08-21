/* ══════════════════════════════════════════════════════════════════
   Krishi Sangam — Comprehensive Testing & Mock Data Seeder
   Seeds complete end-to-end demo data for testing all platform features.
   Password for all test user accounts: password123
   Usage: node seed-comprehensive.js
   ══════════════════════════════════════════════════════════════════ */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const db = getDb();

async function runSeed() {
  console.log('🌱 Starting comprehensive test data seeding for Krishi Sangam...\n');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. CREATE DEMO USERS
  console.log('👤 Creating demo user accounts...');
  
  const users = [
    {
      username: 'farmer_ramesh',
      email: 'ramesh@farmer.in',
      password_hash: passwordHash,
      role: 'farmer',
      phone: '9876543210',
      location: 'Sinnar, Nashik, Maharashtra',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Sinnar',
      taluka: 'Sinnar',
      farm_size: '5',
      farm_size_unit: 'Acres',
      land_ownership: 'Own',
      irrigation_type: 'Borewell & Drip',
      main_crops: 'Wheat, Grapes, Tomatoes',
      soil_type: 'Black Soil (Regur)',
      farming_experience: '12 Years',
      farm_access: 'Tar Road Access (Tractor/Truck Accessible)',
      farm_notes: 'Well-maintained farm near Sinnar highway.',
      skills: 'Farming, Grape Cultivation, Drip Irrigation',
      bio: 'Progressive farmer from Nashik specializing in table grapes and seasonal wheat.',
      farm_lat: 19.8458,
      farm_lng: 73.9984
    },
    {
      username: 'farmer_anita',
      email: 'anita@farmer.in',
      password_hash: passwordHash,
      role: 'farmer',
      phone: '9876543211',
      location: 'Baramati, Pune, Maharashtra',
      state: 'Maharashtra',
      district: 'Pune',
      village: 'Baramati',
      taluka: 'Baramati',
      farm_size: '3',
      farm_size_unit: 'Acres',
      land_ownership: 'Own',
      irrigation_type: 'Canal',
      main_crops: 'Sugarcane, Organic Vegetables',
      soil_type: 'Red Soil',
      farming_experience: '8 Years',
      farm_access: 'Mud Road (Tractor Accessible)',
      farm_notes: 'Organic certified plot.',
      skills: 'Organic Farming, Sugarcane',
      bio: 'Focuses on sustainable sugarcane and organic vegetable cultivation.',
      farm_lat: 18.1520,
      farm_lng: 74.5772
    },
    {
      username: 'provider_suresh',
      email: 'suresh@provider.in',
      password_hash: passwordHash,
      role: 'owner',
      phone: '9833334444',
      location: 'Sinnar, Nashik, Maharashtra',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Sinnar',
      taluka: 'Sinnar',
      skills: 'Tractor Operator, Heavy Machinery, Rotavator',
      bio: 'Provides Mahindra & Swaraj tractors with professional operators across Sinnar and Nashik.',
      farm_lat: 19.8500,
      farm_lng: 74.0000
    },
    {
      username: 'provider_anil',
      email: 'anil@provider.in',
      password_hash: passwordHash,
      role: 'owner',
      phone: '9844445555',
      location: 'Dindori, Nashik, Maharashtra',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Dindori',
      taluka: 'Dindori',
      skills: 'Combine Harvester, Thresher',
      bio: 'Owns high-capacity John Deere harvesters available for broad acreage harvesting.',
      farm_lat: 20.2045,
      farm_lng: 73.8311
    },
    {
      username: 'labour_leader_mahesh',
      email: 'mahesh@labour.in',
      password_hash: passwordHash,
      role: 'labourer',
      phone: '9855556666',
      location: 'Sinnar, Nashik, Maharashtra',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Sinnar',
      taluka: 'Sinnar',
      skills: 'Harvesting, Weeding, Plowing, Sowing, Grape Pruning',
      bio: 'Leader of 10-member experienced farm labour crew available for seasonal work.',
      farm_lat: 19.8400,
      farm_lng: 73.9900
    },
    {
      username: 'labour_sunita',
      email: 'sunita@labour.in',
      password_hash: passwordHash,
      role: 'labourer',
      phone: '9866667777',
      location: 'Baramati, Pune, Maharashtra',
      state: 'Maharashtra',
      district: 'Pune',
      village: 'Baramati',
      taluka: 'Baramati',
      skills: 'Organic Weeding, Sowing, Vegetable Harvesting',
      bio: 'Specialized in delicate crop harvesting and organic weeding.',
      farm_lat: 18.1500,
      farm_lng: 74.5700
    },
    {
      username: 'service_expert_dharani',
      email: 'dharani@service.in',
      password_hash: passwordHash,
      role: 'owner',
      phone: '9899990000',
      location: 'Nashik City, Maharashtra',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Nashik',
      taluka: 'Nashik',
      skills: 'Drone Spraying, Soil Testing, Land Preparation, Crop Protection',
      bio: 'Agricultural technology expert providing precision drone spraying and soil analysis.',
      farm_lat: 19.9975,
      farm_lng: 73.7898
    },
    {
      username: 'admin',
      email: 'admin@krishisangam.in',
      password_hash: passwordHash,
      role: 'admin',
      phone: '9999999999',
      location: 'Mumbai, Maharashtra',
      state: 'Maharashtra',
      district: 'Mumbai',
      skills: 'System Administrator',
      bio: 'Krishi Sangam Platform Administrator.'
    }
  ];

  const userIds = {};

  for (const u of users) {
    const existing = await db.prepare('SELECT id FROM users WHERE username = ?').get(u.username);
    if (existing) {
      userIds[u.username] = existing.id;
      // Update password hash and phone so login always works
      await db.prepare(`
        UPDATE users
        SET password_hash = ?, phone = ?, location = ?, district = ?, skills = ?, bio = ?,
            farm_size = COALESCE(?, farm_size), soil_type = COALESCE(?, soil_type), main_crops = COALESCE(?, main_crops),
            farm_lat = COALESCE(?, farm_lat), farm_lng = COALESCE(?, farm_lng)
        WHERE id = ?
      `).run(
        u.password_hash, u.phone, u.location, u.district, u.skills, u.bio,
        u.farm_size || null, u.soil_type || null, u.main_crops || null,
        u.farm_lat || null, u.farm_lng || null, existing.id
      );
    } else {
      const res = await db.prepare(`
        INSERT INTO users (
          username, email, password_hash, role, phone, location, state, district, village, taluka,
          farm_size, farm_size_unit, land_ownership, irrigation_type, main_crops,
          soil_type, farming_experience, farm_access, farm_notes, skills, bio, farm_lat, farm_lng
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        u.username, u.email, u.password_hash, u.role, u.phone, u.location, u.state, u.district, u.village || null, u.taluka || null,
        u.farm_size || null, u.farm_size_unit || null, u.land_ownership || null, u.irrigation_type || null,
        u.main_crops || null, u.soil_type || null, u.farming_experience || null, u.farm_access || null,
        u.farm_notes || null, u.skills || null, u.bio || null, u.farm_lat || null, u.farm_lng || null
      );
      userIds[u.username] = res.lastInsertRowid;
    }
  }

  console.log('✅ Demo users seeded/updated.');

  // 2. SEED EQUIPMENT LISTINGS WITH EXTENDED CATALOGUE
  console.log('🚜 Seeding Equipment Listings with extended catalogue...');

  await db.prepare("DELETE FROM equipment_listings WHERE name LIKE 'Demo%' OR name LIKE 'Mahindra%' OR name LIKE 'Swaraj%' OR name LIKE 'John Deere%' OR name LIKE 'Kubota%'").run();

  const equipItems = [
    {
      owner_id: userIds.provider_suresh,
      name: 'Mahindra 575 DI Tractor (75 HP + Rotavator)',
      type: 'Tractor',
      description: 'Powerful 75 HP Mahindra tractor equipped with 6-feet Heavy Duty Rotavator and 3-bottom Plough. Always supplied with experienced operator. Perfect for land preparation, deep tilling, and seedbed prep.',
      price_per_hour: 650,
      price_per_day: 4200,
      deposit: 10000,
      location: 'Sinnar, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      with_operator: 1,
      hp: 75,
      attachment: 'Rotavator & Plough',
      attachments_list: 'Rotavator, Plough, Cultivator, Trolley',
      brand: 'Mahindra',
      model: '575 DI SP Plus',
      year: 2023,
      registration_number: 'MH-15-BX-4921',
      max_distance: 25,
      lat: 19.8500,
      lng: 74.0000,
      status: 'approved'
    },
    {
      owner_id: userIds.provider_suresh,
      name: 'Swaraj 744 FE Tractor (50 HP + Cultivator)',
      type: 'Tractor',
      description: 'Fuel-efficient 50 HP Swaraj tractor suitable for medium field preparation, harrowing, and trailer hauling. Includes skilled driver.',
      price_per_hour: 500,
      price_per_day: 3400,
      deposit: 8000,
      location: 'Sinnar, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      with_operator: 1,
      hp: 50,
      attachment: 'Cultivator',
      attachments_list: 'Cultivator, Harrow, Rigid Tine',
      brand: 'Swaraj',
      model: '744 FE',
      year: 2022,
      registration_number: 'MH-15-CZ-1102',
      max_distance: 25,
      lat: 19.8600,
      lng: 73.9900,
      status: 'approved'
    },
    {
      owner_id: userIds.provider_anil,
      name: 'John Deere Combine Harvester 5075E',
      type: 'Harvester',
      description: 'Multi-crop self-propelled combine harvester for wheat, soybean, paddy and pulses. Comes with 14ft cutter bar and full operator crew.',
      price_per_hour: 3200,
      price_per_day: 22000,
      deposit: 40000,
      location: 'Dindori, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      with_operator: 1,
      hp: 75,
      attachment: 'Cutter Bar & Thresher',
      attachments_list: 'Grain Cutter Bar, Paddy Reel',
      brand: 'John Deere',
      model: '5075E Harvester',
      year: 2024,
      registration_number: 'MH-15-DY-8890',
      max_distance: 50,
      lat: 20.2045,
      lng: 73.8311,
      status: 'approved'
    },
    {
      owner_id: userIds.provider_suresh,
      name: 'Kubota Mini Orchard Tractor (24 HP)',
      type: 'Tractor',
      description: 'Narrow-track mini tractor for vineyard inter-cultivation and orchard spraying.',
      price_per_hour: 400,
      price_per_day: 2600,
      deposit: 5000,
      location: 'Sinnar, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      with_operator: 0,
      hp: 24,
      attachment: 'Sprayer Attachment',
      attachments_list: 'Power Sprayer 300L',
      brand: 'Kubota',
      model: 'Neostar A211N',
      year: 2023,
      registration_number: 'MH-15-EP-3041',
      max_distance: 20,
      lat: 19.8450,
      lng: 74.0100,
      status: 'pending'
    }
  ];

  for (const item of equipItems) {
    await db.prepare(`
      INSERT INTO equipment_listings (
        owner_id, name, type, description, price_per_hour, price_per_day, deposit,
        location, district, state, with_operator, hp, attachment, attachments_list,
        brand, model, year, registration_number, max_distance, lat, lng, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.owner_id, item.name, item.type, item.description, item.price_per_hour, item.price_per_day, item.deposit,
      item.location, item.district, item.state, item.with_operator, item.hp, item.attachment, item.attachments_list,
      item.brand, item.model, item.year, item.registration_number, item.max_distance, item.lat, item.lng, item.status
    );
  }

  console.log('✅ Equipment listings seeded.');

  // 3. SEED LABOUR SERVICES WITH EXTENDED CATALOGUE
  console.log('👷 Seeding Labour Services with extended catalogue...');

  await db.prepare("DELETE FROM labour_services WHERE title LIKE 'Nashik%' OR title LIKE 'Baramati%' OR title LIKE 'Agri Drone%'").run();

  const labourItems = [
    {
      worker_id: userIds.labour_leader_mahesh,
      title: 'Nashik Harvest & Crop Operations Crew',
      description: 'Reliable group of 10 experienced farm labourers for crop harvesting, grape pruning, land clearing, and manual sowing. Team brings all basic tools.',
      skills: 'Harvesting, Weeding, Plowing, Sowing, Grape Pruning',
      experience_years: 10,
      daily_rate: 400,
      location: 'Sinnar, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      availability: 'available',
      team_size: 10,
      max_distance: 30,
      work_types: 'Harvesting, Weeding, Sowing, Plowing, Pruning',
      crop_experience: 'Wheat, Grape, Sugarcane, Onion, Tomatoes',
      lat: 19.8400,
      lng: 73.9900,
      status: 'approved'
    },
    {
      worker_id: userIds.labour_sunita,
      title: 'Baramati Organic Farming & Weeding Team',
      description: '5-member specialized team for organic weeding, vegetable harvesting, and drip-line cleaning. Careful handling of sensitive crops.',
      skills: 'Organic Weeding, Sowing, Vegetable Harvesting, Drip Maintenance',
      experience_years: 6,
      daily_rate: 350,
      location: 'Baramati, Pune, Maharashtra',
      district: 'Pune',
      state: 'Maharashtra',
      availability: 'available',
      team_size: 5,
      max_distance: 25,
      work_types: 'Organic Weeding, Harvesting, Sowing',
      crop_experience: 'Vegetables, Pulses, Sugarcane',
      lat: 18.1500,
      lng: 74.5700,
      status: 'approved'
    },
    {
      worker_id: userIds.service_expert_dharani,
      title: 'Agri Drone & Chemical Spraying Team',
      description: 'Licensed drone operators providing uniform pesticide, fungicide, and liquid fertilizer spraying. Covers 10 acres in 2 hours with zero soil compaction.',
      skills: 'Drone Spraying, Chemical Application, Crop Disease Analysis',
      experience_years: 5,
      daily_rate: 600,
      location: 'Nashik City, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      availability: 'available',
      team_size: 3,
      max_distance: 40,
      work_types: 'Drone Spraying, Soil Testing, Crop Analysis',
      crop_experience: 'Grapes, Pomegranate, Wheat, Sugarcane, All Crops',
      lat: 19.9975,
      lng: 73.7898,
      status: 'approved'
    }
  ];

  for (const item of labourItems) {
    await db.prepare(`
      INSERT INTO labour_services (
        worker_id, title, description, skills, experience_years, daily_rate,
        location, district, state, availability, team_size, max_distance,
        work_types, crop_experience, lat, lng, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.worker_id, item.title, item.description, item.skills, item.experience_years, item.daily_rate,
      item.location, item.district, item.state, item.availability, item.team_size, item.max_distance,
      item.work_types, item.crop_experience, item.lat, item.lng, item.status
    );
  }

  console.log('✅ Labour services seeded.');

  // 3B. SEED AGRICULTURAL SERVICE LISTINGS
  console.log('🛠️ Seeding Agricultural Service Listings...');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS agri_service_listings (
      id                 BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      provider_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title              TEXT NOT NULL,
      category           TEXT NOT NULL,
      sub_category       TEXT,
      description        TEXT,
      price              INTEGER NOT NULL,
      pricing_type       TEXT DEFAULT 'per_acre' CHECK(pricing_type IN ('per_acre','per_hour','per_day','fixed')),
      equipment_included TEXT,
      service_area_km    INTEGER DEFAULT 25,
      location           TEXT NOT NULL,
      district           TEXT,
      state              TEXT,
      lat                DOUBLE PRECISION,
      lng                DOUBLE PRECISION,
      availability       TEXT DEFAULT 'available' CHECK(availability IN ('available','busy','offline')),
      photo_url          TEXT,
      status             TEXT DEFAULT 'approved' CHECK(status IN ('pending','approved','rejected')),
      created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await db.prepare("DELETE FROM agri_service_listings WHERE title LIKE 'Precision%' OR title LIKE 'Soil%' OR title LIKE 'Laser%' OR title LIKE 'Drip%'").run();

  const agriServiceItems = [
    {
      provider_id: userIds.service_expert_dharani,
      title: 'Precision Agri Drone Spraying & Health Mapping',
      category: 'Crop Protection & Drone Spraying',
      sub_category: 'Fungicide & Pesticide Drone Spraying',
      description: 'Ultra-fast and uniform pesticide/fertilizer spraying using 40L capacity agricultural drones. Zero soil compaction and 95% water saving.',
      price: 450,
      pricing_type: 'per_acre',
      equipment_included: 'DJI Agras T40 Spray Drone, 4 Batteries, Water Tanker',
      service_area_km: 40,
      location: 'Nashik City, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      lat: 19.9975,
      lng: 73.7898,
      photo_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      status: 'approved'
    },
    {
      provider_id: userIds.service_expert_dharani,
      title: 'Soil NPK & Micronutrient Lab Analysis',
      category: 'Soil Testing & Nutrient Management',
      sub_category: 'Soil Testing',
      description: 'Comprehensive 12-parameter soil testing report with custom fertilizer recommendations for high-yield farming.',
      price: 500,
      pricing_type: 'fixed',
      equipment_included: 'Digital NPK Analyzer, pH & EC Meter Kit',
      service_area_km: 30,
      location: 'Sinnar, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      lat: 19.8450,
      lng: 74.0000,
      photo_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      status: 'approved'
    },
    {
      provider_id: userIds.provider_suresh,
      title: 'Laser Land Leveling & Deep Tilling Service',
      category: 'Land Preparation & Tilling',
      sub_category: 'Laser Leveling',
      description: 'Precision laser-guided land leveling to minimize irrigation water wastage and achieve flat seedbeds.',
      price: 800,
      pricing_type: 'per_hour',
      equipment_included: 'Laser Land Leveler + 75 HP Mahindra Tractor',
      service_area_km: 25,
      location: 'Sinnar, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      lat: 19.8500,
      lng: 74.0000,
      photo_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      status: 'approved'
    },
    {
      provider_id: userIds.service_expert_dharani,
      title: 'Automated Drip Irrigation System Installation',
      category: 'Irrigation & Water Systems',
      sub_category: 'Drip Installation',
      description: 'Turnkey installation of drip lines, filter units, and venturi fertilizer injectors for orchards and row crops.',
      price: 1200,
      pricing_type: 'per_acre',
      equipment_included: 'Disc Filters, Venturi Injector, Pipe Laying Tools',
      service_area_km: 35,
      location: 'Baramati, Pune, Maharashtra',
      district: 'Pune',
      state: 'Maharashtra',
      lat: 18.1500,
      lng: 74.5700,
      photo_url: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80',
      status: 'approved'
    },
    {
      provider_id: userIds.service_expert_dharani,
      title: 'Solar Water Pump Maintenance & Inspection',
      category: 'Irrigation & Water Systems',
      sub_category: 'Solar Pump Repair',
      description: 'On-farm testing and maintenance of solar panel arrays, VFD inverters, and submersible pumps.',
      price: 1500,
      pricing_type: 'fixed',
      equipment_included: 'Solar Inverter Diagnostic Tester, Multimeter, Insulation Kit',
      service_area_km: 50,
      location: 'Sinnar, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      lat: 19.8450,
      lng: 74.0000,
      photo_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      status: 'approved'
    },
    {
      provider_id: userIds.labour_leader_mahesh,
      title: 'Grape Vineyard Pruning & Canopy Management',
      category: 'Orchard & Vineyard Management',
      sub_category: 'Vineyard Pruning',
      description: 'Specialized October/April spur pruning, shoot thinning, and bunch regulation for Export-grade Table Grapes.',
      price: 600,
      pricing_type: 'per_acre',
      equipment_included: 'Pneumatic & Hand Pruning Shears, Sanitization Kit',
      service_area_km: 30,
      location: 'Dindori, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      lat: 20.2045,
      lng: 73.8311,
      photo_url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
      status: 'approved'
    },
    {
      provider_id: userIds.service_expert_dharani,
      title: 'Organic Carbon & Soil Health Consultation',
      category: 'Expert Advisory & Consultation',
      sub_category: 'Agronomist Advisory',
      description: '1-on-1 consultation with certified agronomist for organic carbon enrichment, bio-fertilizer schedules, and crop rotation plans.',
      price: 1000,
      pricing_type: 'fixed',
      equipment_included: 'Agronomy Field Kit, Soil Moisture Meter',
      service_area_km: 40,
      location: 'Nashik City, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      lat: 19.9975,
      lng: 73.7898,
      photo_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
      status: 'approved'
    }
  ];

  for (const item of agriServiceItems) {
    await db.prepare(`
      INSERT INTO agri_service_listings (
        provider_id, title, category, sub_category, description, price, pricing_type,
        equipment_included, service_area_km, location, district, state, lat, lng,
        photo_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.provider_id, item.title, item.category, item.sub_category, item.description,
      item.price, item.pricing_type, item.equipment_included, item.service_area_km,
      item.location, item.district, item.state, item.lat, item.lng,
      item.photo_url, item.status
    );
  }

  console.log('✅ Agricultural service listings seeded.');

  // 3C. SEED LAND LISTINGS FOR LEASING
  console.log('🌾 Seeding Land Listings for Leasing...');

  await db.prepare("DELETE FROM land_listings WHERE title LIKE '5 Acre%' OR title LIKE '8 Acre%' OR title LIKE '3 Acre%' OR title LIKE '12 Acre%'").run();

  const landItems = [
    {
      owner_id: userIds.farmer_ramesh,
      title: '5 Acre Irrigated Farm in Sinnar, Nashik',
      description: 'Well-irrigated fertile farmland near Sinnar highway, ideal for sugarcane, onion, or vegetables. Borewell with drip irrigation, 2 km from main road.',
      area_acres: 5,
      lease_type: 'Per Season',
      price_per_season: 40000,
      price_per_year: 120000,
      location: 'Sinnar, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      soil_type: 'Black Soil',
      water_source: 'Borewell & Drip',
      status: 'approved'
    },
    {
      owner_id: userIds.farmer_anita,
      title: '8 Acre Grape Farm near Dindori',
      description: 'Established grape vineyard plot with drip irrigation, godown, and labour quarters. Perfect for table grapes and wine varieties.',
      area_acres: 8,
      lease_type: 'Per Year',
      price_per_season: 95000,
      price_per_year: 280000,
      location: 'Dindori, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      soil_type: 'Loamy Soil',
      water_source: 'Canal',
      status: 'approved'
    },
    {
      owner_id: userIds.farmer_anita,
      title: '3 Acre Organic Farmland in Baramati',
      description: 'Certified organic-friendly plot near Baramati. River water access, solar fencing provided, suitable for vegetables and horticulture.',
      area_acres: 3,
      lease_type: 'Per Season',
      price_per_season: 25000,
      price_per_year: 75000,
      location: 'Baramati, Pune, Maharashtra',
      district: 'Pune',
      state: 'Maharashtra',
      soil_type: 'Alluvial Soil',
      water_source: 'River',
      status: 'approved'
    }
  ];

  for (const l of landItems) {
    await db.prepare(`
      INSERT INTO land_listings (
        owner_id, title, description, area_acres, lease_type, price_per_season, price_per_year,
        location, district, state, soil_type, water_source, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
    `).run(
      l.owner_id, l.title, l.description, l.area_acres, l.lease_type, l.price_per_season, l.price_per_year,
      l.location, l.district, l.state, l.soil_type, l.water_source
    );
  }

  console.log('✅ Land listings seeded.');

  // 3D. SEED PRODUCE LISTINGS FOR MARKETPLACE
  console.log('🍏 Seeding Produce Listings for Marketplace...');

  await db.prepare("DELETE FROM produce_listings WHERE crop_name LIKE 'Fresh Nashik%' OR crop_name LIKE 'Organic Red%' OR crop_name LIKE 'Nagpur%' OR crop_name LIKE 'Cotton%'").run();

  const produceItems = [
    {
      seller_id: userIds.farmer_ramesh,
      crop_name: 'Fresh Nashik Grapes (Thompson Seedless)',
      description: 'Export quality Thompson Seedless grapes. Crisp, sweet, uniform berry size harvested from certified vineyard.',
      quantity: 500,
      unit: 'kg',
      price_per_unit: 60,
      location: 'Sinnar, Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      quality_grade: 'A',
      status: 'approved'
    },
    {
      seller_id: userIds.farmer_anita,
      crop_name: 'Organic Red Onions (Garwa Quality)',
      description: 'Dry, well-cured Garwa variety red onions with excellent shelf life. Suitable for storage and long-distance transport.',
      quantity: 100,
      unit: 'quintal',
      price_per_unit: 2200,
      location: 'Baramati, Pune, Maharashtra',
      district: 'Pune',
      state: 'Maharashtra',
      quality_grade: 'A',
      status: 'approved'
    },
    {
      seller_id: userIds.farmer_ramesh,
      crop_name: 'Nagpur Oranges (Sweet Mandarin)',
      description: 'Juicy, fresh Nagpur oranges from orchard harvest. Ideal for retail markets and juice processing.',
      quantity: 300,
      unit: 'kg',
      price_per_unit: 45,
      location: 'Nagpur, Maharashtra',
      district: 'Nagpur',
      state: 'Maharashtra',
      quality_grade: 'A',
      status: 'approved'
    }
  ];

  for (const p of produceItems) {
    await db.prepare(`
      INSERT INTO produce_listings (
        seller_id, crop_name, description, quantity, unit, price_per_unit,
        location, district, state, quality_grade, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
    `).run(
      p.seller_id, p.crop_name, p.description, p.quantity, p.unit, p.price_per_unit,
      p.location, p.district, p.state, p.quality_grade
    );
  }

  console.log('✅ Produce listings seeded.');

  // 4. SEED PROVIDER AVAILABILITY CALENDAR
  console.log('📅 Seeding Provider Availability Calendar records...');

  await db.prepare('DELETE FROM provider_availability').run();

  const today = new Date();
  const nextDate = (daysAhead) => {
    const d = new Date(today);
    d.setDate(today.getDate() + daysAhead);
    return d.toISOString().slice(0, 10);
  };

  const availRecords = [
    { provider_id: userIds.provider_suresh, date: nextDate(3), status: 'unavailable', note: 'Tractor servicing & oil change' },
    { provider_id: userIds.provider_suresh, date: nextDate(4), status: 'unavailable', note: 'Prior booking in Niphad' },
    { provider_id: userIds.provider_suresh, date: nextDate(5), status: 'available', note: 'Free for bookings' },
    { provider_id: userIds.labour_leader_mahesh, date: nextDate(5), status: 'unavailable', note: 'Team booked for grape harvest' },
    { provider_id: userIds.labour_leader_mahesh, date: nextDate(6), status: 'available', note: 'Available' }
  ];

  for (const r of availRecords) {
    await db.prepare(`
      INSERT INTO provider_availability (provider_id, date, status, note)
      VALUES (?, ?, ?, ?)
    `).run(r.provider_id, r.date, r.status, r.note);
  }

  console.log('✅ Availability calendar records seeded.');

  // 5. SEED SERVICE BOOKINGS ACROSS ALL 7 LIFECYCLE STAGES
  console.log('📦 Seeding Service Bookings across all lifecycle stages...');

  // Ensure check constraint allows 'active' status for in-progress work
  try {
    await db.exec(`
      ALTER TABLE service_bookings DROP CONSTRAINT IF EXISTS service_bookings_status_check;
      ALTER TABLE service_bookings ADD CONSTRAINT service_bookings_status_check CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled'));
    `);
  } catch (err) {
    // ignore if constraint fails
  }

  await db.prepare("DELETE FROM service_bookings WHERE description LIKE 'Test%' OR description LIKE 'Smart%' OR service_name LIKE 'Mahindra%' OR service_name LIKE 'Nashik%' OR category LIKE 'Crop%'").run();

  const bookingsToInsert = [
    {
      user_id: userIds.farmer_ramesh,
      owner_id: userIds.provider_suresh,
      kind: 'equipment',
      category: 'Tractor & Tillage',
      service_name: 'Mahindra 575 DI Tractor (75 HP + Rotavator)',
      days: 2,
      start_date: nextDate(1),
      location: 'Sinnar, Nashik, Maharashtra',
      lat: 19.8458,
      lng: 73.9984,
      hp: 75,
      attachment: 'Rotavator',
      farm_size: '5 Acres',
      description: 'Test Booking #1 — PENDING stage: Farmer Ramesh requested Mahindra Tractor for tilling 5 acres.',
      price: 8400,
      farm_for: 'my_farm',
      farm_details: 'Location: Sinnar, Nashik • Size: 5 Acres • Soil: Black Soil • Crop: Wheat',
      otp_code: '4829',
      otp_verified: 0,
      status: 'pending',
      payment_status: 'unpaid'
    },
    {
      user_id: userIds.farmer_ramesh,
      owner_id: userIds.labour_leader_mahesh,
      kind: 'labour_team',
      category: 'Farm Workers',
      service_name: 'Nashik Harvest & Crop Operations Crew',
      num_workers: 8,
      days: 3,
      start_date: nextDate(0),
      location: 'Sinnar, Nashik, Maharashtra',
      lat: 19.8458,
      lng: 73.9984,
      farm_size: '5 Acres',
      description: 'Test Booking #2 — ACTIVE (In Progress) stage: 8 workers harvesting grape vineyard. OTP has been verified by provider Mahesh.',
      price: 9600,
      farm_for: 'my_farm',
      farm_details: 'Location: Sinnar, Nashik • Size: 5 Acres • Soil: Black Soil • Crop: Grapes',
      otp_code: '1234',
      otp_verified: 1,
      status: 'active',
      payment_status: 'escrow'
    },
    {
      user_id: userIds.farmer_anita,
      owner_id: userIds.service_expert_dharani,
      kind: 'service',
      category: 'Crop Protection & Drones',
      service_name: 'Precision Agri Drone Spraying',
      num_workers: 2,
      start_date: nextDate(-2),
      location: 'Baramati, Pune, Maharashtra',
      lat: 18.1520,
      lng: 74.5772,
      description: 'Test Booking #3 — COMPLETED & RELEASED stage: Drone spraying of organic fungicide across 3 acres of sugarcane.',
      price: 1800,
      farm_for: 'other_farm',
      farm_details: 'Village: Baramati • District: Pune • Size: 3 Acres • Soil: Red • Crop: Sugarcane • Irrigation: Canal',
      otp_code: '9012',
      otp_verified: 1,
      status: 'completed',
      payment_status: 'released',
      rating: 5,
      review_comment: 'Outstanding drone spraying service! Covered 3 acres in less than an hour with zero crop damage. Highly recommended!'
    }
  ];

  const bookingIds = [];
  for (const b of bookingsToInsert) {
    const res = await db.prepare(`
      INSERT INTO service_bookings (
        user_id, owner_id, kind, category, service_name, num_workers, days,
        start_date, location, lat, lng, hp, attachment, farm_size, description,
        price, farm_for, farm_details, otp_code, otp_verified, status, payment_status,
        rating, review_comment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      b.user_id, b.owner_id, b.kind, b.category, b.service_name, b.num_workers || null, b.days || null,
      b.start_date, b.location, b.lat, b.lng, b.hp || null, b.attachment || null, b.farm_size || null, b.description,
      b.price, b.farm_for, b.farm_details, b.otp_code, b.otp_verified, b.status, b.payment_status,
      b.rating || null, b.review_comment || null
    );
    bookingIds.push(res.lastInsertRowid);
  }

  console.log('✅ Service bookings seeded.');

  // 6. SEED REVIEWS & RATINGS
  console.log('⭐ Seeding Reviews & Ratings...');

  try {
    await db.exec(`
      ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_booking_id_fkey;
      ALTER TABLE reviews ALTER COLUMN booking_id DROP NOT NULL;
    `);
  } catch (err) {
    // ignore
  }

  await db.prepare("DELETE FROM reviews WHERE comment LIKE 'Outstanding%' OR comment LIKE 'Excellent%'").run();

  if (bookingIds[2]) {
    await db.prepare(`
      INSERT INTO reviews (reviewer_id, reviewee_id, booking_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      userIds.farmer_anita,
      userIds.service_expert_dharani,
      bookingIds[2],
      5,
      'Outstanding drone spraying service! Covered 3 acres in less than an hour with zero crop damage. Highly recommended!'
    );
  }

  console.log('✅ Reviews seeded.');

  console.log('\n🎉 ALL MOCK DATA SEEDED SUCCESSFULLY!');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('🔑 DEMO LOGIN CREDENTIALS FOR TESTING (Password for all: password123)');
  console.log('1. Farmer User 1:     farmer_ramesh / 9876543210 (Has saved farm profile)');
  console.log('2. Farmer User 2:     farmer_anita / 9876543211 (Has custom farm & completed booking)');
  console.log('3. Equipment Owner:   provider_suresh / 9833334444 (Tractor owner with calendar)');
  console.log('4. Labour Team Lead:  labour_leader_mahesh / 9855556666 (10-worker team lead)');
  console.log('5. Service Provider:  service_expert_dharani / 9899990000 (Drone spraying specialist)');
  console.log('6. Platform Admin:    admin / 9999999999 (Full admin access)');
  console.log('─────────────────────────────────────────────────────────────\n');

  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});

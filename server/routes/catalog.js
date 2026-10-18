/* ═══════════════════════════════════════════
   Krishi Sangam — server/routes/catalog.js
   Dynamic Catalog for Equipments & Agricultural Services
   Features:
   - Admin CRUD for custom equipment & service fields
   - Multi-regional names & local dialect aliases (e.g. 20km dialect differences like पाभर / Pabhara / पेरणी यंत्र)
   - Public GET endpoints for dynamic forms and filters
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/* ── Default initial seed catalog data ── */
const DEFAULT_EQUIPMENT = [
  // Tractor & Tillage
  {
    name: 'Tractor (45-55 HP)',
    category: 'Tractor & Tillage',
    regional_names: 'ट्रॅक्टर, गाडी, Tractor Gadi',
    region: 'All Regions',
    icon: 'tractor',
    default_rate: 3500,
    description: 'Multi-utility agricultural tractor with driver for ploughing, rotavation, haulage and heavy fieldwork.'
  },
  {
    name: 'Mini Tractor (24-30 HP)',
    category: 'Tractor & Tillage',
    regional_names: 'छोटा ट्रॅक्टर, बाग ट्रॅक्टर, Chhota Tractor, कॉम्पॅक्ट ट्रॅक्टर',
    region: 'Western Maharashtra / Nashik',
    icon: 'tractor',
    default_rate: 2200,
    description: 'Narrow-width tractor designed specifically for inter-row work in sugarcane, vineyards and pomegranate orchards.'
  },
  {
    name: 'Rotavator (Rotary Tiller)',
    category: 'Tractor & Tillage',
    regional_names: 'रोटाव्हेटर, मशागत यंत्र, Churner, रोटा',
    region: 'All Regions',
    icon: 'wrench',
    default_rate: 1600,
    description: 'High-speed rotary tiller that crushes hard soil clods and creates a fine seedbed in a single pass.'
  },
  {
    name: 'Cultivator / Tine Harrow',
    category: 'Tractor & Tillage',
    regional_names: 'नांगर, नागर, नांगऱ्या, Hal, 9-फणी, कल्टिव्हेटर',
    region: 'Maharashtra / Central India',
    icon: 'wrench',
    default_rate: 1200,
    description: 'Secondary tillage implement for loosening compacted soil and weed root eradication.'
  },
  {
    name: 'Disc / Mouldboard Plough',
    category: 'Tractor & Tillage',
    regional_names: 'लोखंडी नांगर, पलटी नांगर, Palti Nangar, रिव्हर्सिबल नांगर',
    region: 'All Regions',
    icon: 'wrench',
    default_rate: 1500,
    description: 'Heavy hydraulic reversible plough for deep soil turning and burying green manure.'
  },
  {
    name: 'Ridge Maker / Furrower',
    category: 'Tractor & Tillage',
    regional_names: 'सारा यंत्र, सरी यंत्र, सरी वरंबा, Ridger, बंड फॉर्मर',
    region: 'Nashik / Pune / Western Maharashtra',
    icon: 'wrench',
    default_rate: 1200,
    description: 'Forms uniform raised ridges and furrows for sugarcane, potato, turmeric, and onion cultivation.'
  },
  {
    name: 'Laser Land Leveler',
    category: 'Tractor & Tillage',
    regional_names: 'लेझर सपाटीकरण यंत्र, लेझर लेव्हलर, Laser Leveler',
    region: 'All Regions',
    icon: 'zap',
    default_rate: 4000,
    description: 'Laser-guided land leveling transmitter and bucket system; saves up to 30% water and enhances fertilizer efficiency.'
  },

  // Sowing & Planting
  {
    name: 'Seed Drill (Automatic)',
    category: 'Sowing & Planting',
    regional_names: 'पाभर, Pabhara, पेरणी यंत्र, Perani Yantra, तिफण (Tifan)',
    region: 'Maharashtra / Marathwada / Vidarbha',
    icon: 'wheat',
    default_rate: 1400,
    description: 'Precision tractor seed drill with simultaneous seed and fertilizer box for uniform germination.'
  },
  {
    name: 'Paddy Transplanter',
    category: 'Sowing & Planting',
    regional_names: 'भात लावणी यंत्र, राईस ट्रान्सप्लांटर, Paddy Planter',
    region: 'Konkan / Coastal Belts',
    icon: 'seedling',
    default_rate: 3000,
    description: 'Self-propelled 4-row rice seedling transplanter for uniform nursery seedling spacing.'
  },

  // Crop Protection
  {
    name: 'Battery Sprayer (16L)',
    category: 'Crop Protection',
    regional_names: 'फवारणी पंप, बॅटरी पंप, औषध फवारणी, Favarni Pump, चार्जिंग पंप',
    region: 'All Regions',
    icon: 'leaf',
    default_rate: 300,
    description: '16-litre double-motor rechargeable knapsack sprayer for pest and disease control.'
  },
  {
    name: 'Agricultural Drone Sprayer (10L/16L)',
    category: 'Crop Protection',
    regional_names: 'ड्रोन फवारणी, ड्रोन पंप, Aerial Drone Favarni, कृषी ड्रोन',
    region: 'All Regions',
    icon: 'drone',
    default_rate: 4500,
    description: 'GPS-guided aerial spraying drone; sprays 1 acre in 7-10 minutes with uniform droplet coverage.'
  },
  {
    name: 'Tractor Mounted Boom Sprayer',
    category: 'Crop Protection',
    regional_names: 'ट्रॅक्टर फवारणी यंत्र, बूम स्प्रेअर, एचटीपी पंप, Boom Sprayer',
    region: 'Nashik / Ahmednagar',
    icon: 'leaf',
    default_rate: 1800,
    description: 'Wide boom sprayer spanning 25-30 feet with adjustable brass nozzles for onion, cotton and pulses.'
  },
  {
    name: 'Power Mist Blower',
    category: 'Crop Protection',
    regional_names: 'पॉवर स्प्रेअर, एसटीपी पंप, मिस्ट ब्लोअर, धुरी यंत्र',
    region: 'All Regions',
    icon: 'leaf',
    default_rate: 600,
    description: 'High-velocity petrol mist blower for tall crops, trees and greenhouse applications.'
  },

  // Harvest & Post-Harvest
  {
    name: 'Combine Harvester',
    category: 'Harvest & Post-Harvest',
    regional_names: 'कापणी यंत्र, मळणी यंत्र, हार्वेस्टर (Harvester), कम्बाईन',
    region: 'All Regions',
    icon: 'wheat',
    default_rate: 6500,
    description: 'Heavy crawler or wheeled combine harvester that cuts, threshes, separates and cleans grain on the spot.'
  },
  {
    name: 'Multi-Crop Thresher',
    category: 'Harvest & Post-Harvest',
    regional_names: 'मळणी यंत्र, मळणीयंत्र, थ्रेशर, कडबा कुट्टी (Kadbi Kutti)',
    region: 'Maharashtra / Vidarbha',
    icon: 'wheat',
    default_rate: 2000,
    description: 'Threshes grains (wheat, chana, soybean, jowar, bajra) directly into clean bags.'
  },
  {
    name: 'Paddy & Wheat Reaper',
    category: 'Harvest & Post-Harvest',
    regional_names: 'कापणी यंत्र, रीपर, धान्य कापणी, Crop Reaper',
    region: 'All Regions',
    icon: 'wheat',
    default_rate: 1500,
    description: 'Front-mounted tractor or walking reaper that cuts standing stalks and lays them in neat windrows.'
  },

  // Irrigation
  {
    name: 'Portable Sprinkler Kit',
    category: 'Irrigation',
    regional_names: 'स्प्रिंकलर, तुषार सिंचन पाईप, फवारा पाईप, स्प्रिंकलर सेट',
    region: 'All Regions',
    icon: 'shower',
    default_rate: 800,
    description: 'Quick-coupling portable HDPE sprinkler pipes and brass rotating impact nozzles.'
  },
  {
    name: 'Rain Gun Sprinkler',
    category: 'Irrigation',
    regional_names: 'रेन गन, तोफ स्प्रिंकलर, Rain Gun, तोफ फवारा',
    region: 'All Regions',
    icon: 'shower',
    default_rate: 1000,
    description: 'High pressure 30-40m spray radius rain gun for sugarcane, maize and open pastures.'
  },
  {
    name: 'Water Pump (Diesel/Electric)',
    category: 'Irrigation',
    regional_names: 'पाण्याचा पंप, डिझेल इंजिन, मोटार, Water Engine, ऑइल इंजिन',
    region: 'All Regions',
    icon: 'shower',
    default_rate: 1200,
    description: 'High-discharge centrifugal water transfer pump for river or farm pond lifting.'
  },
  {
    name: 'Submersible Borewell Pump',
    category: 'Irrigation',
    regional_names: 'सबमर्सिबल पंप, बोअरवेल मोटर, विहिरीचा पंप',
    region: 'All Regions',
    icon: 'shower',
    default_rate: 1000,
    description: 'Deep-well multi-stage submersible pump for continuous irrigation supply.'
  },

  // Orchard & Garden
  {
    name: 'Brush Cutter / Power Weeder',
    category: 'Orchard & Garden',
    regional_names: 'गवत कापणी यंत्र, ग्रास कटर, वीडर, तण काढणी मशीन',
    region: 'All Regions',
    icon: 'tree',
    default_rate: 700,
    description: 'Petrol-engine hand-held brush cutter with circular blade and nylon cord for weed eradication.'
  },
  {
    name: 'Pole Pruner & Chainsaw',
    category: 'Orchard & Garden',
    regional_names: 'झाडांची छाटणी मशीन, झाड कटिंग, Chainsaw, करवत मशीन',
    region: 'Nashik / Orchard Belts',
    icon: 'tree',
    default_rate: 900,
    description: 'Telescopic pole pruner and petrol chainsaw for mango, coconut and grape canopy shaping.'
  },

  // Utilities & Farm Maintenance
  {
    name: 'Portable Generator (3-5 KVA)',
    category: 'Utilities',
    regional_names: 'जनरेटर, लाईट जनरेटर, पॉवर जनरेटर',
    region: 'All Regions',
    icon: 'zap',
    default_rate: 1200,
    description: 'Silent inverter generator providing 230V electricity for farm machinery, lights and pumps.'
  },
  {
    name: 'Chaff Cutter (Kadba Kutti Machine)',
    category: 'Farm Maintenance',
    regional_names: 'कडबा कुट्टी मशीन, चारा कापणी यंत्र, कुट्टी मशीन',
    region: 'All Regions',
    icon: 'wheat',
    default_rate: 800,
    description: 'High-speed motor fodder cutter for producing digestible green and dry fodder for cattle.'
  }
];

const DEFAULT_SERVICES = [
  // Land Preparation & Tilling
  {
    service_name: 'Deep Land Ploughing',
    category: 'Land Preparation & Tilling',
    regional_names: 'खोल नांगरट, नांगरणे, Palti Nangar, नांगरट काम',
    region: 'All Regions',
    pricing_type: 'per_acre',
    description: 'Deep soil turning and inversion using hydraulic reversible mouldboard plough to aerate soil and eliminate dormant pests.'
  },
  {
    service_name: 'Rotavation & Soil Pulverizing',
    category: 'Land Preparation & Tilling',
    regional_names: 'रोटाव्हेटर मारणे, रोटावणे, बारिक मशागत, रोटरी मशागत',
    region: 'All Regions',
    pricing_type: 'per_acre',
    description: 'Tilling and mixing crop residue to prepare a fine clod-free seedbed.'
  },
  {
    service_name: 'Laser Land Leveling',
    category: 'Land Preparation & Tilling',
    regional_names: 'लेझर सपाटीकरण, लेझर लेव्हलर काम, जमीन सपाटीकरण',
    region: 'All Regions',
    pricing_type: 'per_acre',
    description: 'Laser-guided topographic leveling ensuring uniform water movement across the entire plot.'
  },
  {
    service_name: 'Ridge & Furrow Making',
    category: 'Land Preparation & Tilling',
    regional_names: 'सरी वरंबा काढणे, सरी सोडणे, सारा पाडणे, बंड तयार करणे',
    region: 'Nashik / Pune',
    pricing_type: 'per_acre',
    description: 'Creating raised bed channels at specified width for sugarcane, turmeric, onion or potato.'
  },

  // Crop Protection & Drone Spraying
  {
    service_name: 'Drone Pesticide & Fungicide Spraying',
    category: 'Crop Protection & Drone Spraying',
    regional_names: 'ड्रोन फवारणी, Aerial Spraying, हवाई फवारणी, ड्रोन औषध फवारणी',
    region: 'All Regions',
    pricing_type: 'per_acre',
    description: 'Centimeter-precision aerial drone spraying that saves chemical costs and prevents soil trampling.'
  },
  {
    service_name: 'Tractor Boom Crop Spraying',
    category: 'Crop Protection & Drone Spraying',
    regional_names: 'ट्रॅक्टरने औषध फवारणी, बूम स्प्रे काम, एचटीपी फवारणी',
    region: 'All Regions',
    pricing_type: 'per_acre',
    description: 'High-pressure canopy penetrating pesticide spraying for large acreage field crops.'
  },
  {
    service_name: 'Orchard High-Pressure Spraying',
    category: 'Crop Protection & Drone Spraying',
    regional_names: 'बागेतील फवारणी, द्राक्ष/डाळिंब फवारणी, मिस्ट ब्लोअर स्प्रे',
    region: 'Nashik / Solapur / Sangli',
    pricing_type: 'per_acre',
    description: 'Specialized air-assisted orchard sprayer for table grapes, pomegranates, and citrus.'
  },

  // Sowing, Planting & Nursery
  {
    service_name: 'Paddy (Rice) Transplantation',
    category: 'Sowing, Planting & Nursery',
    regional_names: 'भात लावणी, रोपे लावणे, Bhat Lavani, रोप लावणी',
    region: 'Konkan / Western Maharashtra',
    pricing_type: 'per_acre',
    description: 'Skilled agricultural labour group for traditional or mechanical transplantation of rice seedlings.'
  },
  {
    service_name: 'Automated Seed Drilling',
    category: 'Sowing, Planting & Nursery',
    regional_names: 'पाभरीने पेरणी, तिफणीने पेरणी, Perani, बियाणे पेरणे',
    region: 'All Regions',
    pricing_type: 'per_acre',
    description: 'Accurate mechanical sowing of grain seeds with controlled depth and spacing.'
  },
  {
    service_name: 'Sugarcane Planting & Earthing Up',
    category: 'Sowing, Planting & Nursery',
    regional_names: 'ऊस लागवड, उस बांधणी (Earthing Up), ऊस बेणे टोकणे',
    region: 'Western Maharashtra',
    pricing_type: 'per_acre',
    description: 'Ridge preparation, setts planting, nutrient placement, and mechanized soil earthing up.'
  },

  // Crop Harvesting & Threshing
  {
    service_name: 'Combine Grain Harvesting',
    category: 'Crop Harvesting & Threshing',
    regional_names: 'हार्वेस्टरने कापणी, धान्य काढणी, कंबाइन कापणी',
    region: 'All Regions',
    pricing_type: 'per_acre',
    description: 'Machine cutting, threshing and grain separation for wheat, paddy, chana and soybean.'
  },
  {
    service_name: 'Soybean / Pulses Threshing',
    category: 'Crop Harvesting & Threshing',
    regional_names: 'सोयाबीन मळणी, हरभरा मळणी, कडबा काढणे, थ्रेशर काम',
    region: 'Vidarbha / Marathwada',
    pricing_type: 'per_hour',
    description: 'High-capacity tractor thresher operation with dedicated feeder crew and clean bagging.'
  },

  // Soil Testing & Nutrient Management
  {
    service_name: 'Soil Sample Collection & Laboratory Testing',
    category: 'Soil Testing & Nutrient Management',
    regional_names: 'माती परीक्षण, सॉईल टेस्ट, जमीन तपासणी, माती पृथक्करण',
    region: 'All Regions',
    pricing_type: 'fixed',
    description: 'Comprehensive 14-parameter soil lab testing including pH, EC, Organic Carbon, N-P-K, and micronutrients with fertilizer recommendations.'
  },

  // Orchard & Vineyard Management
  {
    service_name: 'Grapevine Pruning & Girdling',
    category: 'Orchard & Vineyard Management',
    regional_names: 'द्राक्ष छाटणी, एप्रिल/ऑक्टोबर छाटणी, गर्डलिंग, बाग कटिंग',
    region: 'Nashik / Sangli',
    pricing_type: 'per_day',
    description: 'Certified master pruners for vegetative (April) and forward (October) grape cane pruning.'
  },

  // Irrigation & Water Systems
  {
    service_name: 'Drip Irrigation Installation & Testing',
    category: 'Irrigation & Water Systems',
    regional_names: 'ठिबक सिंचन बसवणे, ड्रिप जोडणी, लॅटरल टाकणे, ड्रिप फिटिंग',
    region: 'All Regions',
    pricing_type: 'per_acre',
    description: 'Turnkey drip irrigation installation including header unit, disc filters, venturi injector, sub-mains and inline drippers.'
  }
];

/* ── Database table initialization & idempotent seed ── */
async function ensureCatalogTables(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS catalog_equipment (
      id             BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      name           TEXT NOT NULL,
      category       TEXT NOT NULL,
      regional_names TEXT,
      region         TEXT DEFAULT 'All Regions',
      description    TEXT,
      icon           TEXT DEFAULT 'wrench',
      default_rate   INTEGER DEFAULT 1500,
      is_active      INTEGER DEFAULT 1 CHECK(is_active IN (0,1)),
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS catalog_agri_services (
      id             BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
      service_name   TEXT NOT NULL,
      category       TEXT NOT NULL,
      regional_names TEXT,
      region         TEXT DEFAULT 'All Regions',
      pricing_type   TEXT DEFAULT 'per_acre' CHECK(pricing_type IN ('per_acre','per_hour','per_day','fixed')),
      description    TEXT,
      is_active      INTEGER DEFAULT 1 CHECK(is_active IN (0,1)),
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_cat_equip_cat ON catalog_equipment(category);
    CREATE INDEX IF NOT EXISTS idx_cat_equip_active ON catalog_equipment(is_active);
    CREATE INDEX IF NOT EXISTS idx_cat_svc_cat ON catalog_agri_services(category);
    CREATE INDEX IF NOT EXISTS idx_cat_svc_active ON catalog_agri_services(is_active);
  `);

  // Auto-seed if tables are empty
  const countEquip = await db.prepare('SELECT COUNT(*) as c FROM catalog_equipment').get();
  if (Number(countEquip?.c || 0) === 0) {
    const insertEq = db.prepare(`
      INSERT INTO catalog_equipment (name, category, regional_names, region, icon, default_rate, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const eq of DEFAULT_EQUIPMENT) {
      await insertEq.run(eq.name, eq.category, eq.regional_names, eq.region, eq.icon, eq.default_rate, eq.description);
    }
  }

  const countSvc = await db.prepare('SELECT COUNT(*) as c FROM catalog_agri_services').get();
  if (Number(countSvc?.c || 0) === 0) {
    const insertSvc = db.prepare(`
      INSERT INTO catalog_agri_services (service_name, category, regional_names, region, pricing_type, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const svc of DEFAULT_SERVICES) {
      await insertSvc.run(svc.service_name, svc.category, svc.regional_names, svc.region, svc.pricing_type, svc.description);
    }
  }
}

/* ═══════════════════════════════════════════
   PUBLIC READ ENDPOINTS
   ═══════════════════════════════════════════ */

/* ── GET /api/catalog/equipment — List equipment catalogue items ── */
router.get('/equipment', async (req, res) => {
  try {
    const db = getDb();
    await ensureCatalogTables(db);

    const { search, category, region, all } = req.query;
    let query = `SELECT * FROM catalog_equipment WHERE 1=1`;
    const params = [];

    // By default, public only sees active entries unless all=true (for admin)
    if (all !== 'true') {
      query += ` AND is_active = 1`;
    }

    if (category && category !== 'All') {
      query += ` AND category ILIKE ?`;
      params.push(`%${category}%`);
    }

    if (region && region !== 'All' && region !== 'All Regions') {
      query += ` AND (region ILIKE ? OR region ILIKE 'All%')`;
      params.push(`%${region}%`);
    }

    if (search) {
      query += ` AND (name ILIKE ? OR regional_names ILIKE ? OR category ILIKE ? OR description ILIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY category ASC, name ASC`;
    const items = await db.prepare(query).all(...params);

    // Group by category for easy consumption by client browse views
    const categoriesMap = {};
    for (const item of items) {
      if (!categoriesMap[item.category]) {
        categoriesMap[item.category] = {
          category: item.category,
          icon: item.icon || 'wrench',
          items: []
        };
      }
      categoriesMap[item.category].items.push(item);
    }

    res.json({
      equipment: items,
      grouped: Object.values(categoriesMap),
      count: items.length
    });
  } catch (err) {
    console.error('Catalog equipment fetch error:', err);
    res.status(500).json({ error: 'Server error fetching equipment catalog.' });
  }
});

/* ── GET /api/catalog/services — List agricultural service catalogue items ── */
router.get('/services', async (req, res) => {
  try {
    const db = getDb();
    await ensureCatalogTables(db);

    const { search, category, region, all } = req.query;
    let query = `SELECT * FROM catalog_agri_services WHERE 1=1`;
    const params = [];

    if (all !== 'true') {
      query += ` AND is_active = 1`;
    }

    if (category && category !== 'All') {
      query += ` AND category ILIKE ?`;
      params.push(`%${category}%`);
    }

    if (region && region !== 'All' && region !== 'All Regions') {
      query += ` AND (region ILIKE ? OR region ILIKE 'All%')`;
      params.push(`%${region}%`);
    }

    if (search) {
      query += ` AND (service_name ILIKE ? OR regional_names ILIKE ? OR category ILIKE ? OR description ILIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY category ASC, service_name ASC`;
    const services = await db.prepare(query).all(...params);

    // Group by category
    const categoriesMap = {};
    for (const item of services) {
      if (!categoriesMap[item.category]) {
        categoriesMap[item.category] = {
          category: item.category,
          services: []
        };
      }
      categoriesMap[item.category].services.push(item);
    }

    res.json({
      services,
      grouped: Object.values(categoriesMap),
      count: services.length
    });
  } catch (err) {
    console.error('Catalog services fetch error:', err);
    res.status(500).json({ error: 'Server error fetching services catalog.' });
  }
});

/* ═══════════════════════════════════════════
   ADMIN PROTECTED CRUD ENDPOINTS
   ═══════════════════════════════════════════ */

/* ── POST /api/catalog/equipment — Create new equipment item ── */
router.post('/equipment', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    await ensureCatalogTables(db);

    const { name, category, regional_names, region, description, icon, default_rate, is_active } = req.body;

    if (!name || !name.trim() || !category || !category.trim()) {
      return res.status(400).json({ error: 'Equipment name and category are required.' });
    }

    const result = await db.prepare(`
      INSERT INTO catalog_equipment (
        name, category, regional_names, region, description, icon, default_rate, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      category.trim(),
      regional_names ? regional_names.trim() : null,
      region ? region.trim() : 'All Regions',
      description ? description.trim() : null,
      icon || 'wrench',
      default_rate ? Number(default_rate) : 1500,
      is_active !== undefined ? Number(is_active) : 1
    );

    const created = await db.prepare('SELECT * FROM catalog_equipment WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Equipment added to catalog successfully!', item: created });
  } catch (err) {
    console.error('Admin create equipment error:', err);
    res.status(500).json({ error: 'Server error adding equipment.' });
  }
});

/* ── PUT /api/catalog/equipment/:id — Update equipment item ── */
router.put('/equipment/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    await ensureCatalogTables(db);

    const existing = await db.prepare('SELECT * FROM catalog_equipment WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Equipment not found in catalog.' });

    const { name, category, regional_names, region, description, icon, default_rate, is_active } = req.body;

    await db.prepare(`
      UPDATE catalog_equipment
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          regional_names = COALESCE(?, regional_names),
          region = COALESCE(?, region),
          description = COALESCE(?, description),
          icon = COALESCE(?, icon),
          default_rate = COALESCE(?, default_rate),
          is_active = COALESCE(?, is_active),
          updated_at = NOW()
      WHERE id = ?
    `).run(
      name !== undefined ? name.trim() : null,
      category !== undefined ? category.trim() : null,
      regional_names !== undefined ? regional_names.trim() : null,
      region !== undefined ? region.trim() : null,
      description !== undefined ? description.trim() : null,
      icon !== undefined ? icon : null,
      default_rate !== undefined ? Number(default_rate) : null,
      is_active !== undefined ? Number(is_active) : null,
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM catalog_equipment WHERE id = ?').get(req.params.id);
    res.json({ message: 'Equipment updated successfully!', item: updated });
  } catch (err) {
    console.error('Admin update equipment error:', err);
    res.status(500).json({ error: 'Server error updating equipment.' });
  }
});

/* ── DELETE /api/catalog/equipment/:id — Delete equipment item ── */
router.delete('/equipment/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    await ensureCatalogTables(db);

    const existing = await db.prepare('SELECT * FROM catalog_equipment WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Equipment not found in catalog.' });

    await db.prepare('DELETE FROM catalog_equipment WHERE id = ?').run(req.params.id);
    res.json({ message: 'Equipment removed from catalog.' });
  } catch (err) {
    console.error('Admin delete equipment error:', err);
    res.status(500).json({ error: 'Server error deleting equipment.' });
  }
});

/* ── POST /api/catalog/services — Create new agricultural service ── */
router.post('/services', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    await ensureCatalogTables(db);

    const { service_name, category, regional_names, region, pricing_type, description, is_active } = req.body;

    if (!service_name || !service_name.trim() || !category || !category.trim()) {
      return res.status(400).json({ error: 'Service name and category are required.' });
    }

    const result = await db.prepare(`
      INSERT INTO catalog_agri_services (
        service_name, category, regional_names, region, pricing_type, description, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      service_name.trim(),
      category.trim(),
      regional_names ? regional_names.trim() : null,
      region ? region.trim() : 'All Regions',
      pricing_type || 'per_acre',
      description ? description.trim() : null,
      is_active !== undefined ? Number(is_active) : 1
    );

    const created = await db.prepare('SELECT * FROM catalog_agri_services WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Agricultural service added to catalog!', item: created });
  } catch (err) {
    console.error('Admin create service error:', err);
    res.status(500).json({ error: 'Server error adding service.' });
  }
});

/* ── PUT /api/catalog/services/:id — Update agricultural service ── */
router.put('/services/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    await ensureCatalogTables(db);

    const existing = await db.prepare('SELECT * FROM catalog_agri_services WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Service not found in catalog.' });

    const { service_name, category, regional_names, region, pricing_type, description, is_active } = req.body;

    await db.prepare(`
      UPDATE catalog_agri_services
      SET service_name = COALESCE(?, service_name),
          category = COALESCE(?, category),
          regional_names = COALESCE(?, regional_names),
          region = COALESCE(?, region),
          pricing_type = COALESCE(?, pricing_type),
          description = COALESCE(?, description),
          is_active = COALESCE(?, is_active),
          updated_at = NOW()
      WHERE id = ?
    `).run(
      service_name !== undefined ? service_name.trim() : null,
      category !== undefined ? category.trim() : null,
      regional_names !== undefined ? regional_names.trim() : null,
      region !== undefined ? region.trim() : null,
      pricing_type !== undefined ? pricing_type : null,
      description !== undefined ? description.trim() : null,
      is_active !== undefined ? Number(is_active) : null,
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM catalog_agri_services WHERE id = ?').get(req.params.id);
    res.json({ message: 'Agricultural service updated successfully!', item: updated });
  } catch (err) {
    console.error('Admin update service error:', err);
    res.status(500).json({ error: 'Server error updating service.' });
  }
});

/* ── DELETE /api/catalog/services/:id — Delete agricultural service ── */
router.delete('/services/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    await ensureCatalogTables(db);

    const existing = await db.prepare('SELECT * FROM catalog_agri_services WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Service not found in catalog.' });

    await db.prepare('DELETE FROM catalog_agri_services WHERE id = ?').run(req.params.id);
    res.json({ message: 'Agricultural service removed from catalog.' });
  } catch (err) {
    console.error('Admin delete service error:', err);
    res.status(500).json({ error: 'Server error deleting service.' });
  }
});

/* ── POST /api/catalog/seed-defaults — Restore default catalog ── */
router.post('/seed-defaults', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    await ensureCatalogTables(db);

    // Insert any missing default equipment
    const insertEq = db.prepare(`
      INSERT INTO catalog_equipment (name, category, regional_names, region, icon, default_rate, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    let addedEq = 0;
    for (const eq of DEFAULT_EQUIPMENT) {
      const exists = await db.prepare('SELECT id FROM catalog_equipment WHERE name = ? AND category = ?').get(eq.name, eq.category);
      if (!exists) {
        await insertEq.run(eq.name, eq.category, eq.regional_names, eq.region, eq.icon, eq.default_rate, eq.description);
        addedEq++;
      }
    }

    // Insert any missing default services
    const insertSvc = db.prepare(`
      INSERT INTO catalog_agri_services (service_name, category, regional_names, region, pricing_type, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    let addedSvc = 0;
    for (const svc of DEFAULT_SERVICES) {
      const exists = await db.prepare('SELECT id FROM catalog_agri_services WHERE service_name = ? AND category = ?').get(svc.service_name, svc.category);
      if (!exists) {
        await insertSvc.run(svc.service_name, svc.category, svc.regional_names, svc.region, svc.pricing_type, svc.description);
        addedSvc++;
      }
    }

    res.json({ message: `Catalog sync complete. Added ${addedEq} equipments and ${addedSvc} services.` });
  } catch (err) {
    console.error('Seed defaults error:', err);
    res.status(500).json({ error: 'Server error restoring defaults.' });
  }
});

module.exports = router;
module.exports.ensureCatalogTables = ensureCatalogTables;

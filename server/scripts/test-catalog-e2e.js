/* ═══════════════════════════════════════════
   End-to-End Test for Equipment & Services Catalog
   ═══════════════════════════════════════════ */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { getDb } = require('../db');
const { ensureCatalogTables } = require('../routes/catalog');

async function runTests() {
  console.log('--- STARTING CATALOG E2E TESTS ---');
  const db = getDb();

  // 1. Ensure tables
  console.log('1. Testing ensureCatalogTables...');
  await ensureCatalogTables(db);
  const equipCount = await db.prepare('SELECT COUNT(*) as c FROM catalog_equipment').get();
  const svcCount = await db.prepare('SELECT COUNT(*) as c FROM catalog_agri_services').get();
  console.log(`   Initial Catalog: ${equipCount.c} Equipments, ${svcCount.c} Services.`);
  if (equipCount.c === 0 || svcCount.c === 0) {
    throw new Error('Catalog auto-seed failed!');
  }

  // 2. Test inserting a new equipment with regional 20km dialect names
  console.log('2. Testing admin insert of custom equipment with regional names...');
  const testEquipName = 'Custom Sugarcane Harvester Test';
  const testRegionalNames = 'ऊस तोडणी यंत्र, ऊस हार्वेस्टर, Cane Cutter (20km local)';
  const insertRes = await db.prepare(`
    INSERT INTO catalog_equipment (
      name, category, regional_names, region, description, icon, default_rate, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    testEquipName,
    'Harvest & Post-Harvest',
    testRegionalNames,
    'Western Maharashtra (Kolhapur-Sangli Belt)',
    'High-efficiency mechanized sugarcane base-cutting and de-trashing machine.',
    'wheat',
    8000,
    1
  );
  const createdEquipId = insertRes.lastInsertRowid;
  console.log(`   Created equipment ID: ${createdEquipId}`);

  // Verify created item
  const fetchedEquip = await db.prepare('SELECT * FROM catalog_equipment WHERE id = ?').get(createdEquipId);
  if (!fetchedEquip || fetchedEquip.name !== testEquipName) {
    throw new Error('Failed to retrieve newly created equipment!');
  }
  console.log(`   Verified Equipment Name: "${fetchedEquip.name}", Region: "${fetchedEquip.region}"`);
  console.log(`   Regional Dialects: "${fetchedEquip.regional_names}"`);

  // 3. Test updating regional names (e.g. adding another dialect name for nearby taluka)
  console.log('3. Testing updating regional names for newly reported local dialect...');
  const updatedRegionalNames = testRegionalNames + ', बेणे तोडणी यंत्र';
  await db.prepare(`
    UPDATE catalog_equipment
    SET regional_names = ?, default_rate = ?
    WHERE id = ?
  `).run(updatedRegionalNames, 8500, createdEquipId);

  const updatedEquip = await db.prepare('SELECT * FROM catalog_equipment WHERE id = ?').get(createdEquipId);
  if (!updatedEquip.regional_names.includes('बेणे तोडणी यंत्र') || updatedEquip.default_rate !== 8500) {
    throw new Error('Update equipment regional names failed!');
  }
  console.log('   Equipment updated successfully with new regional dialect:', updatedEquip.regional_names);

  // 4. Test inserting a new Agricultural Service
  console.log('4. Testing admin insert of agricultural service with regional names...');
  const testSvcName = 'Precision Laser Grading & Contouring';
  const testSvcRegional = 'लेझर सपाटीकरण, लेझर ताली मारणे, Laser Dhal (20km)';
  const svcInsertRes = await db.prepare(`
    INSERT INTO catalog_agri_services (
      service_name, category, regional_names, region, pricing_type, description, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    testSvcName,
    'Land Preparation & Tilling',
    testSvcRegional,
    'Nashik & Sinnar',
    'per_acre',
    'Millimeter precision GPS/laser guidance for water conservation.',
    1
  );
  const createdSvcId = svcInsertRes.lastInsertRowid;
  console.log(`   Created agricultural service ID: ${createdSvcId}`);

  const fetchedSvc = await db.prepare('SELECT * FROM catalog_agri_services WHERE id = ?').get(createdSvcId);
  if (!fetchedSvc || fetchedSvc.service_name !== testSvcName) {
    throw new Error('Failed to retrieve newly created service!');
  }
  console.log(`   Verified Service: "${fetchedSvc.service_name}", Regional: "${fetchedSvc.regional_names}"`);

  // 5. Test search query with regional dialect expansion
  console.log('5. Testing search query resolution with regional dialect expansion...');
  // Search by Marathi word "पाभर"
  const pabharaMatches = await db.prepare(
    `SELECT name, regional_names FROM catalog_equipment
     WHERE name ILIKE ? OR regional_names ILIKE ?`
  ).all('%पाभर%', '%पाभर%');
  console.log(`   Search "पाभर" matched: ${pabharaMatches.map(m => `${m.name} [${m.regional_names}]`).join('; ')}`);
  if (!pabharaMatches.some(m => m.name.toLowerCase().includes('seed drill'))) {
    throw new Error('Expected "पाभर" to match "Seed Drill"!');
  }

  // Search by Marathi word "रोटाव्हेटर"
  const rotaMatches = await db.prepare(
    `SELECT name, regional_names FROM catalog_equipment
     WHERE name ILIKE ? OR regional_names ILIKE ?`
  ).all('%रोटाव्हेटर%', '%रोटाव्हेटर%');
  console.log(`   Search "रोटाव्हेटर" matched: ${rotaMatches.map(m => `${m.name} [${m.regional_names}]`).join('; ')}`);
  if (!rotaMatches.some(m => m.name.toLowerCase().includes('rotavator'))) {
    throw new Error('Expected "रोटाव्हेटर" to match "Rotavator"!');
  }

  // Search service by Marathi word "भात लावणी"
  const lavaniMatches = await db.prepare(
    `SELECT service_name, regional_names FROM catalog_agri_services
     WHERE service_name ILIKE ? OR regional_names ILIKE ?`
  ).all('%भात लावणी%', '%भात लावणी%');
  console.log(`   Search "भात लावणी" matched: ${lavaniMatches.map(m => `${m.service_name} [${m.regional_names}]`).join('; ')}`);
  if (!lavaniMatches.some(m => m.service_name.toLowerCase().includes('paddy'))) {
    throw new Error('Expected "भात लावणी" to match "Paddy (Rice) Transplantation"!');
  }

  // 6. Test cleanup of test rows
  console.log('6. Cleaning up test rows...');
  await db.prepare('DELETE FROM catalog_equipment WHERE id = ?').run(createdEquipId);
  await db.prepare('DELETE FROM catalog_agri_services WHERE id = ?').run(createdSvcId);

  const checkDeletedEquip = await db.prepare('SELECT id FROM catalog_equipment WHERE id = ?').get(createdEquipId);
  const checkDeletedSvc = await db.prepare('SELECT id FROM catalog_agri_services WHERE id = ?').get(createdSvcId);
  if (checkDeletedEquip || checkDeletedSvc) {
    throw new Error('Cleanup failed!');
  }
  console.log('   Test rows deleted cleanly.');

  console.log('--- ALL BACKEND CATALOG TESTS PASSED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

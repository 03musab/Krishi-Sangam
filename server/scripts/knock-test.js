/* ═══════════════════════════════════════════
   Krishi Sangam — server/scripts/knock-test.js
   One-off helper: verifies the KNOCK_API_KEY and lists workflows.
   Run: node scripts/knock-test.js   (requires KNOCK_API_KEY in env/.env)
   ═══════════════════════════════════════════ */

require('dotenv').config();
const { Knock } = require('@knocklabs/node');

async function main() {
  const key = process.env.KNOCK_API_KEY;
  if (!key) {
    console.log('❌ KNOCK_API_KEY is not set.');
    return;
  }
  console.log(`✅ KNOCK_API_KEY present (sk_...${key.slice(-4)})`);

  const knock = new Knock({ apiKey: key });

  // 1. List workflows
  try {
    const res = await knock.workflows.list({});
    console.log('📋 Workflows in this workspace:');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.log('❌ Could not list workflows:', err.message);
    if (err.response && err.response.status === 401) {
      console.log('   → The key appears to be invalid or lacks Management API access.');
    }
  }

  // 2. Identify a throwaway recipient to confirm the key can write
  try {
    await knock.users.identify('phone:+910000000000', { phone_number: '+910000000000' });
    console.log('✅ User identify call succeeded — key has write access.');
  } catch (err) {
    console.log('❌ User identify failed:', err.message);
  }
}

main();

/* ═══════════════════════════════════════════
   Krishi Sangam — server/scripts/2factor-test.js
   Sends a test OTP via the 2Factor.in V1 API and reports the session_id.

   Usage:
     node scripts/2factor-test.js 9876543210           # uses TFACTOR_API_KEY from env
     node scripts/2factor-test.js 9876543210 123456    # send a specific OTP
   ═══════════════════════════════════════════ */

require('dotenv').config();
const { toE164 } = require('../lib/sms');

async function main() {
  const phone = process.argv[2];
  const fixedOtp = process.argv[3];
  if (!phone || !/^\d{10}$/.test(String(phone).replace(/\D/g, ''))) {
    console.error('Usage: node scripts/2factor-test.js <10-digit-phone> [otp]');
    process.exit(1);
  }

  const apiKey = process.env.TFACTOR_API_KEY;

  if (!apiKey) {
    console.log('⚠️  TFACTOR_API_KEY not set — dev mode is active (OTP is returned in the API response).');
    console.log('   Add it to server/.env to send real SMS.');
    process.exit(0);
  }

  const otp = fixedOtp || String(Math.floor(100000 + Math.random() * 900000));
  console.log(`📲 2Factor.in OTP test → ${toE164(phone)} (otp=${otp})`);

  const url = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/${phone}/${otp}`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();

  if (data.Status !== 'Success') {
    console.log(`❌ Send failed: ${data.Details || data.Message || JSON.stringify(data)}`);
    if (/invalid.*api[ _-]?key|api[ _-]?key.*invalid/i.test(data.Details || '')) console.log('   → Check TFACTOR_API_KEY.');
    if (/balance|insufficient/i.test(data.Details || '')) console.log('   → Top up the 2Factor.in account.');
    process.exit(1);
  }

  console.log(`✓ OTP sent! session_id=${data.Details}`);
  console.log('   Check the phone for the message.');
  console.log(`   To verify: POST https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${data.Details}/${otp}`);
}

main().catch((err) => {
  console.error('❌ Script error:', err.message || err);
  process.exit(1);
});

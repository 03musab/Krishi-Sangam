/* ═══════════════════════════════════════════
   Krishi Sangam — Live Feature Smoke Test Suite
   Usage: BASE_URL=https://krishi-sangam.in node server/scripts/test-features-smoke.js
   ═══════════════════════════════════════════ */

const BASE_URL = (process.env.BASE_URL || 'https://krishi-sangam.in').replace(/\/+$/, '');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`✅ PASS: ${name}`);
  } catch (err) {
    failed++;
    console.error(`❌ FAIL: ${name} -> ${err.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log(`\n🌾 Running Krishi Sangam smoke tests against ${BASE_URL}\n`);

  let indexHtml = '';

  await test('GET / returns 200 HTML with viewport-fit=cover & title', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    indexHtml = await res.text();
    assert(indexHtml.includes('Krishi Sangam'), 'Missing title "Krishi Sangam"');
    assert(indexHtml.includes('viewport-fit=cover'), 'Missing iPhone viewport-fit=cover meta');
  });

  await test('Built JS and CSS assets from index.html return 200', async () => {
    const jsMatch = indexHtml.match(/src="(\/assets\/[^"]+\.js)"/);
    const cssMatch = indexHtml.match(/href="(\/assets\/[^"]+\.css)"/);
    assert(jsMatch && cssMatch, 'Could not find /assets/*.js or /assets/*.css in index.html');
    const [jsRes, cssRes] = await Promise.all([
      fetch(`${BASE_URL}${jsMatch[1]}`, { method: 'HEAD' }),
      fetch(`${BASE_URL}${cssMatch[1]}`, { method: 'HEAD' })
    ]);
    assert(jsRes.status === 200, `JS asset returned ${jsRes.status}`);
    assert(cssRes.status === 200, `CSS asset returned ${cssRes.status}`);
  });

  await test('GET /api/health returns 200 { status: "ok" }', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.status === 'ok', `Unexpected health payload: ${JSON.stringify(data)}`);
  });

  const publicEndpoints = [
    '/api/land',
    '/api/equipment',
    '/api/labour',
    '/api/agri-services',
    '/api/produce',
    '/api/catalog/equipment',
    '/api/catalog/services'
  ];

  for (const ep of publicEndpoints) {
    await test(`GET ${ep} returns 200 JSON`, async () => {
      const res = await fetch(`${BASE_URL}${ep}`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      assert(ct.includes('application/json'), `Expected JSON, got ${ct}`);
      const data = await res.json();
      assert(data !== null && typeof data === 'object', 'Expected JSON object/array');
    });
  }

  const protectedEndpoints = [
    '/api/profile',
    '/api/bookings',
    '/api/messages/unread-count',
    '/api/payments',
    '/api/admin/stats'
  ];

  for (const ep of protectedEndpoints) {
    await test(`GET ${ep} without token returns 401`, async () => {
      const res = await fetch(`${BASE_URL}${ep}`);
      assert(res.status === 401, `Expected 401, got ${res.status}`);
    });
  }

  await test('POST /api/auth/signin with empty body returns 400 JSON', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    const data = await res.json();
    assert(Boolean(data.error), 'Expected JSON error message');
  });

  await test('GET /api/nonexistent-route returns 404 JSON', async () => {
    const res = await fetch(`${BASE_URL}/api/nonexistent-route`);
    assert(res.status === 404, `Expected 404, got ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    assert(ct.includes('application/json'), `Expected JSON 404, got ${ct}`);
  });

  console.log(`\nSummary: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

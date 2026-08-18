const puppeteer = require(require('child_process').execSync('npm root -g').toString().trim() + '/puppeteer');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  page.on('pageerror', err => console.log('  [PAGE ERROR]', err.message));

  // ═══ Navigate to signup ═══
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 20000 });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Sign Up');
    if (btn) btn.click();
  });
  await sleep(1000);

  // ═══════════════════════════════════════════
  //  FARMER FLOW (4 steps)
  // ═══════════════════════════════════════════

  // ── STEP 0: Role Selection ──
  console.log('═══ STEP 0: Role Selection ═══');
  await page.screenshot({ path: 'C:/tmp/flow-0-role.png', fullPage: true });

  const roles = await page.evaluate(() => [...document.querySelectorAll('.role-label')].map(e => e.textContent));
  console.log('  Roles:', roles.join(', '));

  const pills0 = await page.evaluate(() => [...document.querySelectorAll('.step-pill')].map(e => e.textContent.trim()));
  console.log('  Pills:', pills0.join(' | '));

  // Select Farmer + Continue
  await page.evaluate(() => document.querySelectorAll('.role-option')[0].click());
  await sleep(300);
  await page.evaluate(() => document.querySelector('.btn-form-submit:not([disabled])').click());
  await sleep(800);

  // ── STEP 1: Basic Details (Farmer) ──
  console.log('\n═══ STEP 1: Basic Details ═══');
  await page.screenshot({ path: 'C:/tmp/flow-1-basic.png', fullPage: true });

  const pills1 = await page.evaluate(() => [...document.querySelectorAll('.step-pill')].map(e => e.textContent.trim()));
  console.log('  Pills:', pills1.join(' | '));

  const labels1 = await page.evaluate(() => [...document.querySelectorAll('.form-label')].map(e => e.textContent));
  console.log('  Labels:', labels1.join(' | '));

  const safetyNote = await page.evaluate(() => !!document.querySelector('.safety-note'));
  console.log('  Safety note:', safetyNote ? '✓' : '✗');

  // Fill form
  await page.type('input[placeholder="Enter your full name"]', 'Rajesh Kumar');
  await page.type('input[placeholder="10-digit mobile number"]', '9876543210');
  await page.type('input[placeholder="Enter email address"]', 'rajesh@test.com');
  const pwInputs = await page.$$('input[type="password"]');
  if (pwInputs.length >= 2) {
    await pwInputs[0].type('test123456');
    await pwInputs[1].type('test123456');
  }
  console.log('  ✓ Form filled');
  await page.screenshot({ path: 'C:/tmp/flow-1-basic-filled.png', fullPage: true });

  // Send OTP
  await page.click('button[type="submit"]');
  await sleep(2000);
  await page.screenshot({ path: 'C:/tmp/flow-1-otp-sent.png', fullPage: true });
  console.log('  ✓ OTP sent');

  // Skip OTP
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Skip'));
    if (btn) btn.click();
  });
  await sleep(1000);
  console.log('  ✓ OTP skipped');

  // ── STEP 2: Farm Details ──
  const pills2 = await page.evaluate(() => [...document.querySelectorAll('.step-pill')].map(e => e.textContent.trim()));
  console.log('\n═══ STEP 2: Farm Details ═══');
  console.log('  Pills:', pills2.join(' | '));
  await page.screenshot({ path: 'C:/tmp/flow-2-farm.png', fullPage: true });

  const labels2 = await page.evaluate(() => [...document.querySelectorAll('.form-label')].map(e => e.textContent));
  console.log('  Labels:', labels2.join(' | '));

  // Check chip & radio counts
  const chipCount = await page.evaluate(() => document.querySelectorAll('.chip').length);
  const radioCount = await page.evaluate(() => document.querySelectorAll('.radio-option').length);
  console.log('  Chips:', chipCount, '| Radio options:', radioCount);

  // Fill farm size
  const farmSize = await page.$('input[type="number"]');
  if (farmSize) await farmSize.type('8');

  // Select ownership
  await page.evaluate(() => {
    const selects = [...document.querySelectorAll('select')];
    for (const s of selects) {
      if ([...s.options].some(o => o.value === 'Owned')) {
        s.value = 'Owned'; s.dispatchEvent(new Event('change', { bubbles: true })); break;
      }
    }
  });

  // Click Rainfed irrigation chip
  await page.evaluate(() => {
    const chip = [...document.querySelectorAll('.chip')].find(c => c.textContent.includes('Rainfed'));
    if (chip) chip.click();
  });

  // Click crop chips: Wheat, Cotton, Sugarcane
  await page.evaluate(() => {
    const chips = [...document.querySelectorAll('.chip')];
    ['Wheat', 'Cotton', 'Sugarcane'].forEach(name => {
      const c = chips.find(ch => ch.textContent.includes(name));
      if (c) c.click();
    });
  });

  // Select soil type
  await page.evaluate(() => {
    const selects = [...document.querySelectorAll('select')];
    for (const s of selects) {
      if ([...s.options].some(o => o.value === 'Black Soil')) {
        s.value = 'Black Soil'; s.dispatchEvent(new Event('change', { bubbles: true })); break;
      }
    }
  });

  // Select experience
  await page.evaluate(() => {
    const selects = [...document.querySelectorAll('select')];
    for (const s of selects) {
      if ([...s.options].some(o => o.value === '5 – 10 years')) {
        s.value = '5 – 10 years'; s.dispatchEvent(new Event('change', { bubbles: true })); break;
      }
    }
  });

  // Select farm access (Tractor accessible)
  await page.evaluate(() => {
    const radio = document.querySelector('.radio-option input[type="radio"]');
    if (radio) radio.click();
  });

  // Fill notes
  const textarea = await page.$('textarea');
  if (textarea) await textarea.type('Farm near main road, good soil quality.');

  console.log('  ✓ Farm details filled');
  await page.screenshot({ path: 'C:/tmp/flow-2-farm-filled.png', fullPage: true });

  // Click Next: Review & Complete
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Review'));
    if (btn) btn.click();
  });
  await sleep(800);

  // ── STEP 3: Location on Map ──
  console.log('\n═══ STEP 3: Location on Map ═══');
  await page.screenshot({ path: 'C:/tmp/flow-3-location.png', fullPage: true });

  const pills3 = await page.evaluate(() => [...document.querySelectorAll('.step-pill')].map(e => e.textContent.trim()));
  console.log('  Pills:', pills3.join(' | '));

  const hasMapElements = await page.evaluate(() => !!document.querySelector('.locate-btn, .map-embed'));
  console.log('  Map elements:', hasMapElements ? '✓' : '✗');

  // Click Next: Review
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Review'));
    if (btn) btn.click();
  });
  await sleep(800);

  // ── STEP 4: Review & Complete ──
  console.log('\n═══ STEP 4: Review & Complete ═══');
  await page.screenshot({ path: 'C:/tmp/flow-4-review.png', fullPage: true });

  const pills4 = await page.evaluate(() => [...document.querySelectorAll('.step-pill')].map(e => e.textContent.trim()));
  console.log('  Pills:', pills4.join(' | '));

  // Review cards
  const reviewCards = await page.evaluate(() => [...document.querySelectorAll('.review-card-title')].map(e => e.textContent));
  console.log('  Review cards:', reviewCards.join(', '));

  // Review data
  const reviewData = await page.evaluate(() => [...document.querySelectorAll('.review-row')].map(el => {
    const l = el.querySelector('.review-label')?.textContent || '';
    const v = el.querySelector('.review-value')?.textContent || '';
    return `  ${l}: ${v}`;
  }));
  console.log('  Review data:');
  reviewData.forEach(r => console.log('    ' + r));

  // Edit buttons
  const editCount = await page.evaluate(() => document.querySelectorAll('.review-edit-btn').length);
  console.log('  Edit buttons:', editCount);

  // Submit button
  const submitText = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Create'));
    return btn ? btn.textContent.trim() : 'NOT FOUND';
  });
  console.log('  Submit button:', submitText);

  // Test edit button → goes back to step 1
  await page.evaluate(() => document.querySelectorAll('.review-edit-btn')[0].click());
  await sleep(500);
  const afterEdit = await page.evaluate(() => {
    const active = document.querySelector('.step-pill.active');
    return active ? active.textContent.trim() : 'UNKNOWN';
  });
  console.log('  Edit Basic Details → step:', afterEdit);

  // Go back to review
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Review'));
    if (btn) btn.click();
  });
  await sleep(500);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Review'));
    if (btn) btn.click();
  });
  await sleep(500);
  await page.screenshot({ path: 'C:/tmp/flow-4-review-final.png', fullPage: true });
  console.log('  ✓ Back to review');

  // ═══════════════════════════════════════════
  //  OWNER/LABOURER FLOW (3 steps)
  // ═══════════════════════════════════════════
  console.log('\n═══ OWNER/LABOURER FLOW ═══');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Sign Up');
    if (btn) btn.click();
  });
  await sleep(1000);

  // Select Owner + Continue
  await page.evaluate(() => document.querySelectorAll('.role-option')[1].click());
  await sleep(300);
  await page.evaluate(() => document.querySelector('.btn-form-submit:not([disabled])').click());
  await sleep(800);

  const ownerPills = await page.evaluate(() => [...document.querySelectorAll('.step-pill')].map(e => e.textContent.trim()));
  console.log('  Owner pills:', ownerPills.join(' | '));
  const ownerLabels = await page.evaluate(() => [...document.querySelectorAll('.form-label')].map(e => e.textContent));
  console.log('  Owner labels:', ownerLabels.join(' | '));
  await page.screenshot({ path: 'C:/tmp/flow-owner-details.png', fullPage: true });

  await browser.close();
  console.log('\n✅ All screenshots saved to C:/tmp/flow-*.png');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

const puppeteer = require(require('child_process').execSync('npm root -g').toString().trim() + '/puppeteer');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  
  const errors = [];
  page.on('pageerror', err => { console.log('  [ERROR]', err.message); errors.push(err.message); });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  [CONSOLE]', msg.text());
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 20000 });
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Sign Up')?.click();
  });
  await sleep(1000);

  // Select Farmer + Continue
  await page.evaluate(() => document.querySelectorAll('.role-option')[0].click());
  await sleep(300);
  await page.evaluate(() => document.querySelector('.btn-form-submit:not([disabled])').click());
  await sleep(800);

  // Fill form
  await page.type('input[placeholder="Enter your full name"]', 'Rajesh Kumar');
  await page.type('input[placeholder="10-digit mobile number"]', '9876543210');
  await page.type('input[placeholder="Enter email address"]', 'rajesh@test.com');
  const pwInputs = await page.$$('input[type="password"]');
  if (pwInputs.length >= 2) {
    await pwInputs[0].type('test123456');
    await pwInputs[1].type('test123456');
  }
  
  // Send OTP
  await page.click('button[type="submit"]');
  await sleep(2000);
  
  // Check page state before skip
  const beforeSkip = await page.evaluate(() => {
    return {
      body: document.body.innerText.substring(0, 300),
      hasForm: !!document.querySelector('.form-body'),
      hasRoleOption: !!document.querySelector('.role-option'),
      hasStepPill: !!document.querySelector('.step-pill'),
      stepPills: [...document.querySelectorAll('.step-pill')].map(e => e.textContent.trim())
    };
  });
  console.log('\nBefore skip OTP:');
  console.log('  hasForm:', beforeSkip.hasForm);
  console.log('  hasStepPill:', beforeSkip.hasStepPill);
  console.log('  stepPills:', beforeSkip.stepPills.join(' | '));
  
  // Click skip
  console.log('\nClicking Skip OTP...');
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Skip'));
    console.log('Skip button found:', !!btn);
    if (btn) btn.click();
  });
  await sleep(2000);
  
  // Check page state after skip
  const afterSkip = await page.evaluate(() => {
    return {
      body: document.body.innerText.substring(0, 500),
      hasForm: !!document.querySelector('.form-body'),
      hasRoleOption: !!document.querySelector('.role-option'),
      hasStepPill: !!document.querySelector('.step-pill'),
      stepPills: [...document.querySelectorAll('.step-pill')].map(e => e.textContent.trim()),
      stepActive: document.querySelector('.step-pill.active')?.textContent?.trim() || 'NONE',
      formLabels: [...document.querySelectorAll('.form-label')].map(e => e.textContent),
      chipCount: document.querySelectorAll('.chip').length,
      radioCount: document.querySelectorAll('.radio-option').length
    };
  });
  console.log('\nAfter skip OTP:');
  console.log('  hasForm:', afterSkip.hasForm);
  console.log('  stepActive:', afterSkip.stepActive);
  console.log('  stepPills:', afterSkip.stepPills.join(' | '));
  console.log('  formLabels:', afterSkip.formLabels.join(' | '));
  console.log('  chips:', afterSkip.chipCount, '| radios:', afterSkip.radioCount);
  
  await page.screenshot({ path: 'C:/tmp/debug-after-skip.png', fullPage: true });
  
  // Show first 500 chars of body text
  console.log('\n  Body text:', afterSkip.body.replace(/\n/g, ' ').trim().substring(0, 300));
  
  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

const puppeteer = require(require('child_process').execSync('npm root -g').toString().trim() + '/puppeteer');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 20000 });
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Sign Up')?.click();
  });
  await sleep(1000);

  // Role selection
  await page.screenshot({ path: 'C:/tmp/wide-0-role.png', fullPage: true });

  // Select Farmer + Continue
  await page.evaluate(() => document.querySelectorAll('.role-option')[0].click());
  await sleep(300);
  await page.evaluate(() => document.querySelector('.btn-form-submit:not([disabled])').click());
  await sleep(800);

  // Basic Details
  await page.screenshot({ path: 'C:/tmp/wide-1-basic.png', fullPage: true });

  // Fill + Send OTP + Skip
  await page.type('input[placeholder="Enter your full name"]', 'Rajesh Kumar');
  await page.type('input[placeholder="10-digit mobile number"]', '9876543210');
  const pw = await page.$$('input[type="password"]');
  if (pw.length >= 2) { await pw[0].type('test123456'); await pw[1].type('test123456'); }
  await page.click('button[type="submit"]');
  await sleep(2000);
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent.includes('Skip'))?.click();
  });
  await sleep(1000);

  // Farm Details
  await page.screenshot({ path: 'C:/tmp/wide-2-farm.png', fullPage: true });

  // Fill farm details
  const fs = await page.$('input[type="number"]');
  if (fs) await fs.type('8');
  await page.evaluate(() => {
    const s = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => o.value === 'Owned'));
    if (s) { s.value = 'Owned'; s.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await page.evaluate(() => {
    document.querySelectorAll('.chip').forEach(c => {
      if (['Wheat','Cotton','Sugarcane'].some(n => c.textContent.includes(n))) c.click();
    });
  });
  await page.evaluate(() => {
    const chip = [...document.querySelectorAll('.chip')].find(c => c.textContent.includes('Rainfed'));
    if (chip) chip.click();
  });
  await page.evaluate(() => {
    const s = [...document.querySelectorAll('select')].find(s => [...s.options].some(o => o.value === 'Black Soil'));
    if (s) { s.value = 'Black Soil'; s.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await page.screenshot({ path: 'C:/tmp/wide-2-farm-filled.png', fullPage: true });

  // Go to Review
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent.includes('Review'))?.click();
  });
  await sleep(800);
  await page.evaluate(() => {
    [...document.querySelectorAll('button')].find(b => b.textContent.includes('Review'))?.click();
  });
  await sleep(800);

  // Review
  await page.screenshot({ path: 'C:/tmp/wide-4-review.png', fullPage: true });

  await browser.close();
  console.log('Screenshots saved to C:/tmp/wide-*.png');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

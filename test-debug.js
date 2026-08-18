const puppeteer = require(require('child_process').execSync('npm root -g').toString().trim() + '/puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  [CONSOLE ERROR]', msg.text());
  });
  page.on('pageerror', err => console.log('  [PAGE ERROR]', err.message));

  await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle2', timeout: 20000 });
  
  // Get page content
  const html = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
  console.log('Page HTML (first 2000 chars):\n', html);
  
  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

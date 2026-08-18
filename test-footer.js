const puppeteer = require(require('child_process').execSync('npm root -g').toString().trim() + '/puppeteer');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 20000 });

  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  await page.screenshot({ path: 'C:/tmp/footer-logo.png', fullPage: false });

  // Check if logo img exists in footer
  const hasLogo = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return false;
    const img = footer.querySelector('img[alt="Krishi Sangam"]');
    return img ? { src: img.src, height: img.offsetHeight } : false;
  });
  console.log('Footer logo:', hasLogo);

  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

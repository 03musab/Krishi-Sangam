const puppeteer = require(require('child_process').execSync('npm root -g').toString().trim() + '/puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Try different URL patterns
  const urls = [
    'http://localhost:5173/signup',
    'http://localhost:5173/#/signup',
    'http://localhost:5173/#signup',
    'http://localhost:5173/'
  ];

  for (const url of urls) {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
    const hasSignUpBtn = await page.evaluate(() => {
      return !!document.querySelector('.role-option, .auth-title, [class*="signup"]');
    });
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 200));
    console.log(`${url}`);
    console.log(`  Has signup elements: ${hasSignUpBtn}`);
    console.log(`  Body text: ${bodyText.replace(/\n/g, ' ').trim().substring(0, 150)}`);
    console.log('');
  }

  // Try clicking the Sign Up button from the nav
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 15000 });
  
  // Find and click Sign Up
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, a')];
    const signUp = btns.find(b => b.textContent.includes('Sign Up'));
    if (signUp) { signUp.click(); return true; }
    return false;
  });
  console.log('Clicked Sign Up button:', clicked);
  await page.waitForTimeout(1000);
  
  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  
  const hasForm = await page.evaluate(() => {
    return !!document.querySelector('.role-option, .form-card, .auth-title');
  });
  console.log('Has form elements:', hasForm);

  const bodyFinal = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Body text:', bodyFinal.replace(/\n/g, ' ').trim().substring(0, 300));

  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

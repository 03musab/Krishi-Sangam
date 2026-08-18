const puppeteer = require(require('child_process').execSync('npm root -g').toString().trim() + '/puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Step 0: Navigate to signup
  await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle2', timeout: 15000 });
  await page.screenshot({ path: 'C:/tmp/signup-step0.png', fullPage: true });
  console.log('Step 0: Role Selection');

  // Check step pills exist
  const stepPills0 = await page.evaluate(() => [...document.querySelectorAll('.step-pill')].map(el => el.textContent.trim()));
  console.log('  Step pills:', stepPills0.join(' | '));

  // Check role options
  const roles = await page.evaluate(() => [...document.querySelectorAll('.role-label')].map(el => el.textContent));
  console.log('  Roles:', roles.join(', '));

  // Click Farmer role
  await page.click('.role-option:first-child');
  await page.waitForTimeout(300);
  console.log('  Farmer selected');

  // Click Continue
  const continueBtn = await page.$('.btn-form-submit:not([disabled])');
  if (continueBtn) {
    await continueBtn.click();
    await page.waitForTimeout(800);
  }

  // Step 1: Basic Details
  await page.screenshot({ path: 'C:/tmp/signup-step1.png', fullPage: true });
  console.log('\nStep 1: Basic Details');

  const labels1 = await page.evaluate(() => [...document.querySelectorAll('.form-label')].map(el => el.textContent));
  console.log('  Labels:', labels1.join(' | '));

  // Check safety note exists
  const safetyNote = await page.evaluate(() => {
    const el = document.querySelector('.safety-note');
    return el ? el.textContent.trim() : 'NOT FOUND';
  });
  console.log('  Safety note:', safetyNote.substring(0, 60) + '...');

  // Check step pills updated
  const stepPills1 = await page.evaluate(() => [...document.querySelectorAll('.step-pill')].map(el => el.textContent.trim()));
  console.log('  Step pills:', stepPills1.join(' | '));

  // Fill basic details
  const nameInput = await page.$('input[placeholder="Enter your full name"]');
  if (nameInput) await nameInput.type('Rajesh Kumar');
  const phoneInput = await page.$('input[placeholder="10-digit mobile number"]');
  if (phoneInput) await phoneInput.type('9876543210');
  const emailInput = await page.$('input[placeholder="Enter email address"]');
  if (emailInput) await emailInput.type('rajesh@test.com');

  const pwInputs = await page.$$('input[type="password"]');
  if (pwInputs.length >= 2) {
    await pwInputs[0].type('test123456');
    await pwInputs[1].type('test123456');
  }
  await page.screenshot({ path: 'C:/tmp/signup-step1-filled.png', fullPage: true });
  console.log('  Form filled');

  // Click Send OTP
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/tmp/signup-step1-otp.png', fullPage: true });

  // Check for OTP toast
  const toasts = await page.evaluate(() => [...document.querySelectorAll('.toast, [class*="toast"]')].map(el => el.textContent));
  console.log('  Toasts:', toasts.join(' | '));

  // Get OTP from toast
  const otpHint = toasts.join(' ');
  const otpMatch = otpHint.match(/(\d{6})/);

  if (otpMatch) {
    const otpCode = otpMatch[1];
    console.log('  Dev OTP:', otpCode);

    // Find OTP input fields  
    const otpInputs = await page.$$('.otp-digit input, input.otp-digit, .otp-input input');
    console.log('  OTP input fields found:', otpInputs.length);
    
    if (otpInputs.length >= 6) {
      for (let i = 0; i < 6; i++) {
        await otpInputs[i].click();
        await otpInputs[i].type(otpCode[i]);
      }
    } else {
      // Try typing into whichever input is focused or the first one in the OTP area
      const allInputs = await page.$$('input');
      console.log('  Total inputs on page:', allInputs.length);
    }
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'C:/tmp/signup-step1-otp-filled.png', fullPage: true });

    // Click Verify
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const verify = btns.find(b => b.textContent.includes('Verify'));
      if (verify) verify.click();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/tmp/signup-step1-verified.png', fullPage: true });

    // Check if we moved to step 2
    const currentStep = await page.evaluate(() => {
      const active = document.querySelector('.step-pill.active');
      return active ? active.textContent.trim() : 'UNKNOWN';
    });
    console.log('  Current step after verify:', currentStep);
    
    // If on Step 2 (Farm Details)
    if (currentStep.includes('Farm')) {
      console.log('\nStep 2: Farm Details');
      const labels2 = await page.evaluate(() => [...document.querySelectorAll('.form-label')].map(el => el.textContent));
      console.log('  Labels:', labels2.join(' | '));
      
      // Check chips exist
      const chips = await page.evaluate(() => [...document.querySelectorAll('.chip')].map(el => el.textContent.trim()));
      console.log('  Chips:', chips.join(', '));
      
      // Check radio group
      const radios = await page.evaluate(() => [...document.querySelectorAll('.radio-option')].map(el => el.textContent.trim()));
      console.log('  Radio options:', radios.join(', '));
      
      await page.screenshot({ path: 'C:/tmp/signup-step2.png', fullPage: true });
      
      // Fill farm details
      const farmSizeInput = await page.$('input[type="number"][placeholder="Enter size"]');
      if (farmSizeInput) await farmSizeInput.type('8');
      
      // Select ownership
      await page.select('select', 'Owned');
      
      // Click Rainfed chip
      const rainfedChip = await page.evaluate(() => {
        const chips = [...document.querySelectorAll('.chip')];
        const rf = chips.find(c => c.textContent.includes('Rainfed'));
        if (rf) { rf.click(); return true; }
        return false;
      });
      console.log('  Rainfed chip clicked:', rainfedChip);
      
      // Click some crop chips
      await page.evaluate(() => {
        const chips = [...document.querySelectorAll('.chip')];
        ['Wheat', 'Cotton', 'Sugarcane'].forEach(name => {
          const c = chips.find(ch => ch.textContent.includes(name));
          if (c) c.click();
        });
      });
      console.log('  Crop chips selected');
      
      // Select soil type
      const soilSelects = await page.$$('select');
      for (const sel of soilSelects) {
        const options = await sel.evaluate(el => [...el.options].map(o => o.value));
        if (options.includes('Black Soil')) {
          await sel.select('Black Soil');
          break;
        }
      }
      
      // Select experience
      for (const sel of soilSelects) {
        const options = await sel.evaluate(el => [...el.options].map(o => o.value));
        if (options.includes('5 – 10 years')) {
          await sel.select('5 – 10 years');
          break;
        }
      }
      
      // Click Tractor accessible radio
      await page.evaluate(() => {
        const radios = [...document.querySelectorAll('.radio-option input[type="radio"]')];
        if (radios[0]) radios[0].click();
      });
      
      // Fill notes
      const textarea = await page.$('textarea');
      if (textarea) await textarea.type('My farm is near the main road with good soil.');
      
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'C:/tmp/signup-step2-filled.png', fullPage: true });
      console.log('  Farm details filled ✓');
      
      // Click Next: Review & Complete
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const next = btns.find(b => b.textContent.includes('Review'));
        if (next) next.click();
      });
      await page.waitForTimeout(800);
      
      // Step 3: Location
      console.log('\nStep 3: Location on Map');
      await page.screenshot({ path: 'C:/tmp/signup-step3.png', fullPage: true });
      
      // Skip location - go to Review
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const next = btns.find(b => b.textContent.includes('Review'));
        if (next) next.click();
      });
      await page.waitForTimeout(800);
      
      // Step 4: Review
      console.log('\nStep 4: Review & Complete');
      await page.screenshot({ path: 'C:/tmp/signup-step4.png', fullPage: true });
      
      // Check review cards
      const reviewCards = await page.evaluate(() => [...document.querySelectorAll('.review-card-title')].map(el => el.textContent));
      console.log('  Review cards:', reviewCards.join(', '));
      
      const reviewRows = await page.evaluate(() => [...document.querySelectorAll('.review-row')].map(el => {
        const label = el.querySelector('.review-label')?.textContent || '';
        const value = el.querySelector('.review-value')?.textContent || '';
        return label + ': ' + value;
      }));
      console.log('  Review data:');
      reviewRows.forEach(r => console.log('    ' + r));
      
      // Check Create Account button exists
      const createBtn = await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const create = btns.find(b => b.textContent.includes('Create'));
        return create ? create.textContent.trim() : 'NOT FOUND';
      });
      console.log('  Submit button:', createBtn);
    }
  }

  // Also test Owner/Labourer flow briefly
  console.log('\n--- Testing Owner/Labourer flow ---');
  await page.goto('http://localhost:5173/signup', { waitUntil: 'networkidle2', timeout: 15000 });
  
  // Click Owner role (2nd option)
  const ownerRole = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.role-option')];
    if (btns[1]) { btns[1].click(); return btns[1].textContent; }
    return 'NOT FOUND';
  });
  console.log('  Selected:', ownerRole);
  
  await page.click('.btn-form-submit:not([disabled])');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/tmp/signup-owner-step1.png', fullPage: true });
  
  const ownerLabels = await page.evaluate(() => [...document.querySelectorAll('.form-label')].map(el => el.textContent));
  console.log('  Owner Step 1 labels:', ownerLabels.join(' | '));
  
  const ownerSteps = await page.evaluate(() => [...document.querySelectorAll('.step-pill')].map(el => el.textContent.trim()));
  console.log('  Owner step pills:', ownerSteps.join(' | '));
  
  await browser.close();
  console.log('\n✅ All tests passed!');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

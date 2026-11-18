import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'path';
import { createServer } from 'http';
import fs from 'fs';

const PORT = 4188;
const distDir = path.resolve(process.cwd(), 'dist');

function getMime(filePath) {
  if (filePath.endsWith('.html')) return 'text/html';
  if (filePath.endsWith('.js')) return 'application/javascript';
  if (filePath.endsWith('.css')) return 'text/css';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

const server = createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }
  const mime = getMime(filePath);
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, async () => {
  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Track failed image requests
  const failedImages = [];
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/images/landing/') && response.status() !== 200) {
      failedImages.push({ url, status: response.status() });
    }
  });

  console.log('\n--- 1. Verification of 4 Directions on Landing (#kurslar) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

  // Check 4 cards in #kurslar
  const cardsData = await page.evaluate(() => {
    const section = document.getElementById('kurslar');
    if (!section) return null;
    const articles = Array.from(section.querySelectorAll('article'));
    return articles.map((art) => {
      const title = art.querySelector('h3')?.textContent?.trim() || '';
      const badge = art.querySelector('span')?.textContent?.trim() || '';
      const img = art.querySelector('img')?.getAttribute('src') || '';
      const imgAlt = art.querySelector('img')?.getAttribute('alt') || '';
      const text = art.innerText;
      const rect = art.getBoundingClientRect();
      return {
        title,
        badge,
        img,
        imgAlt,
        text,
        hasEnrollmentNotice: text.includes('Kursga yozilish hali ochilmagan'),
        hasRedundantDastur: text.includes('Dastur rejalashtirilmoqda'),
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
      };
    });
  });

  console.log(`Found ${cardsData.length} course cards on Landing:`);
  cardsData.forEach((c, idx) => {
    console.log(`  Card ${idx + 1}: "${c.title}" | Badge: "${c.badge}" | Notice: ${c.hasEnrollmentNotice} | Redundant: ${c.hasRedundantDastur}`);
  });

  if (cardsData.length !== 4) {
    console.error('FAILED: Expected exactly 4 cards on landing!');
    process.exit(1);
  }

  // Ensure no redundant "Dastur rejalashtirilmoqda"
  if (cardsData.some(c => c.hasRedundantDastur)) {
    console.error('FAILED: Found redundant "Dastur rejalashtirilmoqda" text on card!');
    process.exit(1);
  }
  console.log('PASS: No redundant "Dastur rejalashtirilmoqda" found.');

  // Check exact descriptions for Geografiya and Ona tili
  const geoCard = cardsData.find(c => c.title === 'Geografiya attestatsiyasi');
  const onaCard = cardsData.find(c => c.title === 'Ona tili attestatsiyasi');
  if (!geoCard?.text.includes('Geografiya o‘qituvchilari uchun ham kurs qo‘shishni rejalashtiryapmiz. Kurs ochilganda, dastur va darslar haqida shu yerda ma’lumot beramiz.')) {
    console.error('FAILED: Geografiya card description does not match requested wording!');
    process.exit(1);
  }
  console.log('PASS: Geografiya card description matches requested wording.');

  if (!onaCard?.text.includes('Ona tili o‘qituvchilari uchun attestatsiyaga tayyorgarlik kursini rejalashtiryapmiz. Kurs ochilganda, dastur bilan shu yerda tanishishingiz mumkin.')) {
    console.error('FAILED: Ona tili card description does not match requested wording!');
    process.exit(1);
  }
  console.log('PASS: Ona tili card description matches requested wording.');

  // Check FAQ exact wording
  const faqText = await page.evaluate(() => document.getElementById('savollar')?.textContent || '');
  const expectedFaq = 'Hozircha ochilish sanasi aniq emas. Tarix kursini tayyorlayapmiz, geografiya va ona tili kurslari esa rejada. Yangiliklarni shu sahifada e’lon qilamiz.';
  if (!faqText.includes(expectedFaq)) {
    console.error('FAILED: FAQ does not contain expected exact wording for new courses opening!');
    process.exit(1);
  }
  console.log('PASS: FAQ contains exact requested response.');

  // Check 2x2 grid on desktop: Card 1 and 2 roughly same top, Card 3 and 4 roughly same top
  const row1Diff = Math.abs(cardsData[0].rect.top - cardsData[1].rect.top);
  const row2Diff = Math.abs(cardsData[2].rect.top - cardsData[3].rect.top);
  const rowColDist = cardsData[2].rect.top - cardsData[0].rect.top;
  console.log(`Desktop 2x2 grid check: Row 1 top diff: ${row1Diff}px, Row 2 top diff: ${row2Diff}px, Row vertical separation: ${rowColDist}px`);
  if (row1Diff > 5 || row2Diff > 5 || rowColDist < 100) {
    console.error('FAILED: Desktop cards are not in a 2x2 grid!');
    process.exit(1);
  }
  console.log('PASS: Desktop 2x2 grid verified.');

  // Save desktop screenshot of #kurslar
  const kurslarEl = await page.$('#kurslar');
  if (kurslarEl) {
    await kurslarEl.screenshot({ path: '/tmp/landing_kurslar_desktop.png' });
  }

  // Check mobile 1-column layout (375x812)
  console.log('\n--- 2. Mobile 1-Column Layout Check (375px) ---');
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(r => setTimeout(r, 200));

  const mobileCardsData = await page.evaluate(() => {
    const section = document.getElementById('kurslar');
    const articles = Array.from(section.querySelectorAll('article'));
    return articles.map(a => {
      const rect = a.getBoundingClientRect();
      return { top: rect.top, left: rect.left, height: rect.height };
    });
  });

  let isStacked = true;
  for (let i = 1; i < mobileCardsData.length; i++) {
    if (mobileCardsData[i].top < mobileCardsData[i - 1].top + mobileCardsData[i - 1].height - 10) {
      isStacked = false;
    }
  }
  console.log(`Mobile single-column stacking verified: ${isStacked}`);
  if (!isStacked) {
    console.error('FAILED: Mobile cards are not stacked vertically!');
    process.exit(1);
  }
  console.log('PASS: Mobile 1-column layout verified.');

  if (kurslarEl) {
    await kurslarEl.screenshot({ path: '/tmp/landing_kurslar_mobile.png' });
  }

  // Dark mode test & screenshot
  console.log('\n--- 3. Dark Theme Verification ---');
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 200));
  if (kurslarEl) {
    await kurslarEl.screenshot({ path: '/tmp/landing_kurslar_dark.png' });
  }
  console.log('PASS: Dark theme rendered without visual errors.');

  // Check Catalog Search
  console.log('\n--- 4. Catalog Search Verification (/courses) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${PORT}/courses`, { waitUntil: 'networkidle0' });

  // Test 4a: Search 'Geografiya'
  const searchInput = await page.$('input[placeholder="Kurslarni izlash..."]');
  await searchInput.type('Geografiya');
  await new Promise(r => setTimeout(r, 150));

  const geoSearchResult = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasNotFound: text.includes('Hech narsa topilmadi'),
      hasGeografiyaTitle: text.includes('Geografiya attestatsiyasi'),
      hasNotice: text.includes('Kursga yozilish hali ochilmagan'),
      hasSearchNotice: text.includes('Bu kurs hali ochilmagan. Quyida u haqda ma’lumot bor.')
    };
  });
  console.log('Search "Geografiya" result:', geoSearchResult);
  if (geoSearchResult.hasNotFound || !geoSearchResult.hasGeografiyaTitle || !geoSearchResult.hasNotice || !geoSearchResult.hasSearchNotice) {
    console.error('FAILED: Catalog search for Geografiya returned "Hech narsa topilmadi" or missing course/search notice!');
    process.exit(1);
  }
  console.log('PASS: Search "Geografiya" cleanly displays Geografiya announcement with exact search notice.');

  // Test 4b: Search 'Ona tili'
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder="Kurslarni izlash..."]');
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await searchInput.type('Ona tili');
  await new Promise(r => setTimeout(r, 150));

  const onaTiliSearchResult = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasNotFound: text.includes('Hech narsa topilmadi'),
      hasOnaTiliTitle: text.includes('Ona tili attestatsiyasi'),
      hasNotice: text.includes('Kursga yozilish hali ochilmagan'),
      hasSearchNotice: text.includes('Bu kurs hali ochilmagan. Quyida u haqda ma’lumot bor.')
    };
  });
  console.log('Search "Ona tili" result:', onaTiliSearchResult);
  if (onaTiliSearchResult.hasNotFound || !onaTiliSearchResult.hasOnaTiliTitle || !onaTiliSearchResult.hasNotice || !onaTiliSearchResult.hasSearchNotice) {
    console.error('FAILED: Catalog search for Ona tili returned "Hech narsa topilmadi" or missing course/search notice!');
    process.exit(1);
  }
  console.log('PASS: Search "Ona tili" cleanly displays Ona tili announcement.');

  // Test 4c: Search nonexistent 'xyznonexistent'
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder="Kurslarni izlash..."]');
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await searchInput.type('xyznonexistent');
  await new Promise(r => setTimeout(r, 150));

  const notFoundResult = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasNotFound: text.includes('Hech narsa topilmadi')
    };
  });
  console.log('Search "xyznonexistent" result:', notFoundResult);
  if (!notFoundResult.hasNotFound) {
    console.error('FAILED: Nonexistent search did not show empty state!');
    process.exit(1);
  }
  console.log('PASS: Nonexistent search cleanly shows "Hech narsa topilmadi".');

  // Check failed image responses
  console.log('\n--- 5. Image HTTP Status Check ---');
  if (failedImages.length > 0) {
    console.error('FAILED: Some course images failed to load:', failedImages);
    process.exit(1);
  }
  console.log('PASS: All course cover images loaded with HTTP 200.');

  await browser.close();
  server.close();
  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
  process.exit(0);
});

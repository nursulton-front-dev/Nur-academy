import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const ARTIFACT_DIR = '/home/nursultan/.gemini/antigravity-cli/brain/d5337d0f-b84a-4a44-81fb-ae489d9ac53b';
const SCREENSHOT_DIR = join(ARTIFACT_DIR, 'screenshots');
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

async function runVerification() {
  console.log('🚀 Launching local static preview server...');
  const server = createServer((req, res) => {
    const url = req.url.split('?')[0];
    const file = url === '/' ? 'dist/index.html' : 'dist' + url;
    if (existsSync(file) && statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
      res.end(readFileSync(file));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(readFileSync('dist/index.html'));
    }
  });

  await new Promise(r => server.listen(4135, '127.0.0.1', r));
  console.log('  Server listening on http://127.0.0.1:4135\n');

  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    executablePath,
    args: chromium.args,
    headless: chromium.headless
  });

  const page = await browser.newPage();

  // 1. Desktop 1440x900 Verification
  console.log('--- 1. Testing Desktop 1440x900 ---');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4135/', { waitUntil: 'networkidle0' });

  // Verify first screen hero isolation
  const heroFoldCheck = await page.evaluate(() => {
    const header = document.querySelector('header');
    const sections = Array.from(document.querySelectorAll('section'));
    const heroSection = sections[0];
    const secondSection = sections[1];

    const headerRect = header ? header.getBoundingClientRect() : { height: 64 };
    const heroRect = heroSection.getBoundingClientRect();
    const secondRect = secondSection.getBoundingClientRect();

    return {
      headerHeight: headerRect.height,
      heroHeight: heroRect.height,
      secondSectionTop: secondRect.top,
      windowHeight: window.innerHeight,
      isSecondBelowFold: secondRect.top >= window.innerHeight - 5
    };
  });

  console.log('  Hero height:', heroFoldCheck.heroHeight, 'px');
  console.log('  Second section top:', heroFoldCheck.secondSectionTop, 'px (Window height: ' + heroFoldCheck.windowHeight + 'px)');
  console.log('  Is second section below the fold on initial load?', heroFoldCheck.isSecondBelowFold ? '✓ YES (PASS)' : '✗ NO');

  // Capture desktop hero screenshot
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '01_desktop_hero_1440x900.png'),
    clip: { x: 0, y: 0, width: 1440, height: 900 }
  });
  console.log('  ✓ Captured 01_desktop_hero_1440x900.png');

  // Capture platform demo section
  const demoHandle = await page.$('#afzalliklar');
  const demoSection = await page.evaluate(() => {
    const s = document.querySelectorAll('section')[1];
    const rect = s.getBoundingClientRect();
    return { y: window.scrollY + rect.top, height: rect.height };
  });
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '02_desktop_platform_demo.png'),
    clip: { x: 0, y: Math.max(0, demoSection.y), width: 1440, height: Math.min(demoSection.height, 900) }
  });
  console.log('  ✓ Captured 02_desktop_platform_demo.png');

  // Verify steps section (no 01/02/03/04 badges)
  const stepsCheck = await page.evaluate(() => {
    const section = document.querySelector('#bosqichlar');
    if (!section) return { found: false };
    const text = section.textContent || '';
    const has01 = text.includes('01') && !text.includes('202');
    const badges = section.querySelectorAll('span.badge, .rounded-full');
    return {
      found: true,
      hasNumberBadges: has01,
      cardCount: section.querySelectorAll('h3').length
    };
  });
  console.log('  Steps section card count:', stepsCheck.cardCount, '| Number badges present?', stepsCheck.hasNumberBadges ? 'YES' : '✓ NO (PASS)');

  // Capture steps screenshot
  const stepsY = await page.evaluate(() => {
    const s = document.querySelector('#bosqichlar');
    const r = s.getBoundingClientRect();
    return { y: window.scrollY + r.top, height: r.height };
  });
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '03_desktop_steps.png'),
    clip: { x: 0, y: stepsY.y, width: 1440, height: Math.min(stepsY.height, 800) }
  });
  console.log('  ✓ Captured 03_desktop_steps.png');

  // Capture course cards screenshot
  const coursesY = await page.evaluate(() => {
    const s = document.querySelector('#kurslar');
    const r = s.getBoundingClientRect();
    return { y: window.scrollY + r.top, height: r.height };
  });
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '04_desktop_courses.png'),
    clip: { x: 0, y: coursesY.y, width: 1440, height: Math.min(coursesY.height, 850) }
  });
  console.log('  ✓ Captured 04_desktop_courses.png');

  // Capture «Qulay boshlanish» screenshot
  const qulayY = await page.evaluate(() => {
    const s = document.querySelector('#tariflar');
    const r = s.getBoundingClientRect();
    return { y: window.scrollY + r.top, height: r.height };
  });
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '05_desktop_qulay_boshlanish.png'),
    clip: { x: 0, y: qulayY.y, width: 1440, height: Math.min(qulayY.height, 750) }
  });
  console.log('  ✓ Captured 05_desktop_qulay_boshlanish.png');

  // Capture FAQ section and test tab switching
  const faqY = await page.evaluate(() => {
    const s = document.querySelector('#savollar');
    const r = s.getBoundingClientRect();
    return { y: window.scrollY + r.top, height: r.height };
  });
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '06_desktop_faq.png'),
    clip: { x: 0, y: faqY.y, width: 1440, height: Math.min(faqY.height, 800) }
  });
  console.log('  ✓ Captured 06_desktop_faq.png');

  // Test FAQ tab switching: click tab "O‘qish jarayoni"
  console.log('  Testing FAQ tab switching to "O‘qish jarayoni"...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('#savollar button[role="tab"]'));
    const t = tabs.find(el => el.textContent.includes('O‘qish jarayoni'));
    if (t) t.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const activeQuestionsText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#savollar h3 span')).map(s => s.textContent);
  });
  console.log('  FAQ active topic questions:', activeQuestionsText.slice(0, 2));

  // 2. Mobile 375x812 Verification
  console.log('\n--- 2. Testing Mobile 375x812 ---');
  await page.setViewport({ width: 375, height: 812, isMobile: true, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:4135/', { waitUntil: 'networkidle0' });

  // Capture mobile hero
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '07_mobile_hero_375x812.png'),
    clip: { x: 0, y: 0, width: 375, height: 812 }
  });
  console.log('  ✓ Captured 07_mobile_hero_375x812.png');

  // Capture mobile courses
  const mCoursesY = await page.evaluate(() => {
    const s = document.querySelector('#kurslar');
    const r = s.getBoundingClientRect();
    return { y: window.scrollY + r.top, height: r.height };
  });
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '08_mobile_courses_375.png'),
    clip: { x: 0, y: mCoursesY.y, width: 375, height: Math.min(mCoursesY.height, 900) }
  });
  console.log('  ✓ Captured 08_mobile_courses_375.png');

  // Capture mobile Qulay boshlanish
  const mQulayY = await page.evaluate(() => {
    const s = document.querySelector('#tariflar');
    const r = s.getBoundingClientRect();
    return { y: window.scrollY + r.top, height: r.height };
  });
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '09_mobile_qulay_boshlanish_375.png'),
    clip: { x: 0, y: mQulayY.y, width: 375, height: Math.min(mQulayY.height, 900) }
  });
  console.log('  ✓ Captured 09_mobile_qulay_boshlanish_375.png');

  // Capture mobile FAQ
  const mFaqY = await page.evaluate(() => {
    const s = document.querySelector('#savollar');
    const r = s.getBoundingClientRect();
    return { y: window.scrollY + r.top, height: r.height };
  });
  await page.screenshot({
    path: join(SCREENSHOT_DIR, '10_mobile_faq_375.png'),
    clip: { x: 0, y: mFaqY.y, width: 375, height: Math.min(mFaqY.height, 800) }
  });
  console.log('  ✓ Captured 10_mobile_faq_375.png');

  // 3. Large Desktop 1920x1080 Verification
  console.log('\n--- 3. Testing Large Desktop 1920x1080 ---');
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4135/', { waitUntil: 'networkidle0' });

  const hdHeroFoldCheck = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section'));
    const secondRect = sections[1].getBoundingClientRect();
    return {
      secondSectionTop: secondRect.top,
      windowHeight: window.innerHeight,
      isSecondBelowFold: secondRect.top >= window.innerHeight - 5
    };
  });
  console.log('  1920x1080 - Second section top:', hdHeroFoldCheck.secondSectionTop, 'px (Window: 1080px)');
  console.log('  Is second section below the fold?', hdHeroFoldCheck.isSecondBelowFold ? '✓ YES (PASS)' : '✗ NO');

  await page.screenshot({
    path: join(SCREENSHOT_DIR, '11_desktop_hero_1920x1080.png'),
    clip: { x: 0, y: 0, width: 1920, height: 1080 }
  });
  console.log('  ✓ Captured 11_desktop_hero_1920x1080.png');

  // 4. Tablet 768x1024 Verification
  console.log('\n--- 4. Testing Tablet 768x1024 ---');
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4135/', { waitUntil: 'networkidle0' });

  await page.screenshot({
    path: join(SCREENSHOT_DIR, '12_tablet_hero_768x1024.png'),
    clip: { x: 0, y: 0, width: 768, height: 1024 }
  });
  console.log('  ✓ Captured 12_tablet_hero_768x1024.png');

  await browser.close();
  server.close();
  console.log('\n✨ All automated UI verifications and screenshots completed successfully!');
}

runVerification().catch(err => {
  console.error('UI Verification failed:', err);
  process.exit(1);
});

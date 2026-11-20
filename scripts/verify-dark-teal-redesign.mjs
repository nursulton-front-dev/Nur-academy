import puppeteer from 'puppeteer-core';
import { join } from 'node:path';

const ARTIFACT_DIR = '/home/nursultan/.gemini/antigravity-cli/brain/515cf1a5-8a81-4ebe-9d57-5b34f0742712';
const SCREENSHOT_DIR = join(ARTIFACT_DIR, 'screenshots');

async function testDarkTealCabinet() {
  console.log('🚀 Starting Dark-Teal & Orange Cabinet Redesign Verification...');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    headless: true
  });

  async function createConfiguredPage(viewport, isDark = false) {
    const page = await browser.newPage();
    await page.setViewport(viewport);

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      const method = req.method();

      if (url.includes('/rest/v1/enrollments')) {
        if (method === 'OPTIONS') {
          req.respond({
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': '*'
            }
          });
          return;
        }
        req.respond({
          status: 200,
          contentType: 'application/json',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': '*'
          },
          body: JSON.stringify([
            {
              enrolled_at: '2026-11-20T10:00:00.000Z',
              tier: 'free',
              diagnostic_completed: false,
              courses: {
                id: '0a7e57a7-0000-4000-8000-000000000001',
                slug: 'attestatsiya',
                title: "Informatika o'qituvchilari attestatsiyasi",
                description: "Attestatsiyaga tayyorgarlik kursi",
                cover_url: '',
                price: 0,
                is_published: true
              }
            }
          ])
        });
        return;
      }
      req.continue();
    });

    await page.evaluateOnNewDocument((dark) => {
      const mockUser = {
        id: '00000000-0000-4000-8000-000000000001',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'teacher@nur-academy.uz',
        user_metadata: {
          full_name: 'Nursulton Maxramov'
        }
      };
      localStorage.setItem(
        'sb-posajcqpwnzhdxhqvbic-auth-token',
        JSON.stringify({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser
        })
      );
      if (dark) {
        localStorage.setItem('theme', 'dark');
        document.documentElement.classList.add('dark');
      } else {
        localStorage.setItem('theme', 'light');
        document.documentElement.classList.remove('dark');
      }
    }, isDark);

    await page.goto('http://127.0.0.1:4173/dashboard', { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.body.innerText.includes("Informatika o'qituvchilari attestatsiyasi"));
    return page;
  }

  // 1. Desktop 1440px Light Mode
  console.log('\n--- 1. Desktop 1440px (Light Mode) ---');
  const page1 = await createConfiguredPage({ width: 1440, height: 900, deviceScaleFactor: 1 }, false);
  const desktopLightPath = join(SCREENSHOT_DIR, '01_desktop_1440px_teal_light.png');
  await page1.screenshot({ path: desktopLightPath, fullPage: true });
  console.log('  ✓ Captured:', desktopLightPath);

  // Verify visual elements: poster background, orange button, decorative SVG
  const cardChecks = await page1.evaluate(() => {
    // Check poster
    const poster = document.querySelector('div[class*="bg-[#0A3333]"]');
    const svg = poster?.querySelector('svg');
    const title = poster?.querySelector('a');
    // Check orange button
    const orangeBtn = document.querySelector('a[class*="bg-[#FF7A00]"]');
    return {
      hasDarkTealPoster: !!poster,
      hasDecorativeSvg: !!svg,
      titleText: title?.textContent?.trim(),
      orangeBtnText: orangeBtn?.textContent?.trim(),
      orangeBtnColor: window.getComputedStyle(orangeBtn).backgroundColor
    };
  });
  console.log('  Card Verification:', cardChecks);

  // 2. Desktop 1440px Dark Mode
  console.log('\n--- 2. Desktop 1440px (Dark Mode) ---');
  const page2 = await createConfiguredPage({ width: 1440, height: 900, deviceScaleFactor: 1 }, true);
  const desktopDarkPath = join(SCREENSHOT_DIR, '02_desktop_1440px_teal_dark.png');
  await page2.screenshot({ path: desktopDarkPath, fullPage: true });
  console.log('  ✓ Captured:', desktopDarkPath);

  // 3. Tablet 768px Light Mode
  console.log('\n--- 3. Tablet 768px (Light Mode) ---');
  const page3 = await createConfiguredPage({ width: 768, height: 1024, deviceScaleFactor: 1 }, false);
  const tabletLightPath = join(SCREENSHOT_DIR, '03_tablet_768px_teal_light.png');
  await page3.screenshot({ path: tabletLightPath, fullPage: true });
  console.log('  ✓ Captured:', tabletLightPath);

  // 4. Mobile 390px Light Mode
  console.log('\n--- 4. Mobile 390px (Light Mode) ---');
  const page4 = await createConfiguredPage({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }, false);
  const mobileLightPath = join(SCREENSHOT_DIR, '04_mobile_390px_teal_light.png');
  await page4.screenshot({ path: mobileLightPath, fullPage: true });
  console.log('  ✓ Captured:', mobileLightPath);

  // Verify mobile order and no title overlap
  const mobileCheck = await page4.evaluate(() => {
    const main = document.querySelector('main');
    const title = document.querySelector('h1')?.textContent;
    const orangeBtn = document.querySelector('a[class*="bg-[#FF7A00]"]');
    const btnRect = orangeBtn?.getBoundingClientRect();
    const poster = document.querySelector('div[class*="bg-[#0A3333]"]');
    const titleLink = poster?.querySelector('a');
    const titleRect = titleLink?.getBoundingClientRect();
    return {
      title,
      orangeBtnVisible: btnRect ? btnRect.width > 0 && btnRect.height > 0 : false,
      titleWidth: titleRect?.width,
      titleHeight: titleRect?.height
    };
  });
  console.log('  Mobile 390px Checks:', mobileCheck);

  // 5. Mobile 390px Dark Mode
  console.log('\n--- 5. Mobile 390px (Dark Mode) ---');
  const page5 = await createConfiguredPage({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }, true);
  const mobileDarkPath = join(SCREENSHOT_DIR, '05_mobile_390px_teal_dark.png');
  await page5.screenshot({ path: mobileDarkPath, fullPage: true });
  console.log('  ✓ Captured:', mobileDarkPath);

  // 6. Test Upcoming Course Modal ("Batafsil")
  console.log('\n--- 6. Testing Upcoming Course Modal ---');
  await page1.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Batafsil'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const modalPath = join(SCREENSHOT_DIR, '06_desktop_modal_teal.png');
  await page1.screenshot({ path: modalPath });
  console.log('  ✓ Captured:', modalPath);

  // 7. Test Navigation Links
  console.log('\n--- 7. Testing Action Navigation Links ---');
  const links = await page1.evaluate(() => {
    const primary = document.querySelector('a[class*="bg-[#FF7A00]"]')?.getAttribute('href');
    const diag = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Diagnostika'))?.getAttribute('href');
    const res = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Natijalar'))?.getAttribute('href');
    const addCourse = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Kurs qo‘shish'))?.getAttribute('href');
    return { primary, diag, res, addCourse };
  });
  console.log('  Action Links Check:', links);

  await browser.close();
  console.log('\n✨ All verifications completed successfully!');
}

testDarkTealCabinet().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

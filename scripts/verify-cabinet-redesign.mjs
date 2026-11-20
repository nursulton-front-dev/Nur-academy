import puppeteer from 'puppeteer-core';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ARTIFACT_DIR = '/home/nursultan/.gemini/antigravity-cli/brain/515cf1a5-8a81-4ebe-9d57-5b34f0742712';
const SCREENSHOT_DIR = join(ARTIFACT_DIR, 'screenshots');

async function testCabinet() {
  console.log('🚀 Starting Comprehensive Cabinet Redesign Verification...');

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
  const desktopLightPath = join(SCREENSHOT_DIR, '01_desktop_1440px_light.png');
  await page1.screenshot({ path: desktopLightPath, fullPage: true });
  console.log('  ✓ Captured:', desktopLightPath);

  // Check Header active indicator
  const headerCheck = await page1.evaluate(() => {
    const links = Array.from(document.querySelectorAll('header nav a'));
    const myLink = links.find(el => el.textContent.includes('Mening kurslarim'));
    return {
      text: myLink?.textContent,
      hasUnderline: myLink?.className.includes('after:bg-accent-blue')
    };
  });
  console.log('  Header Active Indicator:', headerCheck);

  // 2. Desktop 1440px Dark Mode
  console.log('\n--- 2. Desktop 1440px (Dark Mode) ---');
  const page2 = await createConfiguredPage({ width: 1440, height: 900, deviceScaleFactor: 1 }, true);
  const desktopDarkPath = join(SCREENSHOT_DIR, '02_desktop_1440px_dark.png');
  await page2.screenshot({ path: desktopDarkPath, fullPage: true });
  console.log('  ✓ Captured:', desktopDarkPath);

  // 3. Tablet 768px Light Mode
  console.log('\n--- 3. Tablet 768px (Light Mode) ---');
  const page3 = await createConfiguredPage({ width: 768, height: 1024, deviceScaleFactor: 1 }, false);
  const tabletLightPath = join(SCREENSHOT_DIR, '03_tablet_768px_light.png');
  await page3.screenshot({ path: tabletLightPath, fullPage: true });
  console.log('  ✓ Captured:', tabletLightPath);

  // 4. Mobile 390px Light Mode
  console.log('\n--- 4. Mobile 390px (Light Mode) ---');
  const page4 = await createConfiguredPage({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }, false);
  const mobileLightPath = join(SCREENSHOT_DIR, '04_mobile_390px_light.png');
  await page4.screenshot({ path: mobileLightPath, fullPage: true });
  console.log('  ✓ Captured:', mobileLightPath);

  // 5. Mobile 390px Dark Mode
  console.log('\n--- 5. Mobile 390px (Dark Mode) ---');
  const page5 = await createConfiguredPage({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }, true);
  const mobileDarkPath = join(SCREENSHOT_DIR, '05_mobile_390px_dark.png');
  await page5.screenshot({ path: mobileDarkPath, fullPage: true });
  console.log('  ✓ Captured:', mobileDarkPath);

  // 6. Test Upcoming Course Modal ("Batafsil")
  console.log('\n--- 6. Testing Upcoming Course Modal ("Batafsil") ---');
  await page1.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Batafsil'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  const modalPath = join(SCREENSHOT_DIR, '06_desktop_modal_batafsil.png');
  await page1.screenshot({ path: modalPath });
  console.log('  ✓ Captured:', modalPath);

  const modalCheck = await page1.evaluate(() => {
    const modal = document.querySelector('[role="dialog"]');
    return modal ? modal.querySelector('h3')?.textContent : null;
  });
  console.log('  Modal Course Title:', modalCheck);

  // Close with Escape key
  await page1.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 200));
  const modalClosed = await page1.evaluate(() => !document.querySelector('[role="dialog"]'));
  console.log('  Modal closed on Escape key?', modalClosed ? '✓ YES' : '✗ NO');

  await browser.close();
  console.log('\n✨ All cabinet redesign screenshots captured successfully!');
}

testCabinet().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

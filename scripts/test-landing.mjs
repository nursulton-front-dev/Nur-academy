import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname } from 'node:path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

async function check() {
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

  await new Promise(r => server.listen(4128, '127.0.0.1', r));

  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({ executablePath, args: chromium.args, headless: chromium.headless });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  await page.goto('http://127.0.0.1:4128/', { waitUntil: 'networkidle0' });

  // 1. Check mobile menu
  const menuBtn = await page.$('button[aria-label="Menyuni ochish"]');
  if (menuBtn) {
    await menuBtn.click();
    await page.waitForSelector('button[aria-label="Menyuni yopish"]');
    console.log('✓ PASS: Mobile menu opened.');
  }

  // 2. Check FAQ accordion toggle
  const buttons = await page.$$('#savollar button[aria-expanded]');
  if (buttons.length > 1) {
    await buttons[1].click();
    await page.waitForFunction(() => {
      const b = document.querySelectorAll('#savollar button[aria-expanded]')[1];
      return b && b.getAttribute('aria-expanded') === 'true';
    }, { timeout: 3000 });
    console.log('✓ PASS: FAQ accordion toggles correctly with aria-expanded.');
  }

  // 3. Check tabs
  const tabBtn = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button[role="tab"]')).find(el => el.textContent.includes('AI Mentor'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  if (tabBtn) {
    await page.waitForFunction(() => {
      return document.body.textContent.includes('AI Mentor ishorasi');
    }, { timeout: 3000 });
    console.log('✓ PASS: Interactive tab switcher works seamlessly.');
  }

  await browser.close();
  server.close();
}
check().catch(console.error);

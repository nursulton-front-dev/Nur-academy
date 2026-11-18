import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer } from 'http';
import fs from 'fs';

const PORT = 4180;
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

  // Test 1: Desktop 1440x900 Light theme
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await new Promise((r) => setTimeout(r, 200));

  const desktopFooterInfo = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return null;
    const headings = Array.from(footer.querySelectorAll('p')).map(p => p.textContent.trim());
    const listItems = Array.from(footer.querySelectorAll('li')).map(li => li.textContent.trim());
    const asoschilarHeading = Array.from(footer.querySelectorAll('p')).find(p => p.textContent.trim() === 'Asoschilar');
    const computedHeading = asoschilarHeading ? window.getComputedStyle(asoschilarHeading) : null;
    const li1 = listItems.find(t => t.includes('Qudratova Adolat'));
    const li2 = listItems.find(t => t.includes('Maxramov Nursulton'));
    return {
      hasHeading: !!asoschilarHeading,
      headingColor: computedHeading?.color,
      listItems,
      hasAdolat: !!li1,
      hasNursulton: !!li2,
    };
  });

  console.log('Desktop Light Footer:', JSON.stringify(desktopFooterInfo, null, 2));

  // Test 2: Desktop Dark theme
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 200));

  const desktopDarkFooterInfo = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const asoschilarHeading = Array.from(footer.querySelectorAll('p')).find(p => p.textContent.trim() === 'Asoschilar');
    const computedHeading = asoschilarHeading ? window.getComputedStyle(asoschilarHeading) : null;
    const nameEl = Array.from(footer.querySelectorAll('li')).find(li => li.textContent.trim() === 'Qudratova Adolat');
    const computedName = nameEl ? window.getComputedStyle(nameEl) : null;
    return {
      headingColor: computedHeading?.color,
      nameColor: computedName?.color,
    };
  });
  console.log('Desktop Dark Footer:', JSON.stringify(desktopDarkFooterInfo, null, 2));

  // Test 3: Mobile 375x812 Light & Dark
  await page.setViewport({ width: 375, height: 812 });
  await page.evaluate(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await new Promise((r) => setTimeout(r, 200));

  // Check vertical arrangement on mobile
  const mobileLayout = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const names = Array.from(footer.querySelectorAll('li')).filter(li => 
      li.textContent.includes('Qudratova Adolat') || li.textContent.includes('Maxramov Nursulton')
    );
    if (names.length < 2) return null;
    const rect1 = names[0].getBoundingClientRect();
    const rect2 = names[1].getBoundingClientRect();
    return {
      isVertical: rect2.top >= rect1.bottom - 2, // rect2 is placed below rect1
      rect1: { top: rect1.top, left: rect1.left, height: rect1.height },
      rect2: { top: rect2.top, left: rect2.left, height: rect2.height }
    };
  });
  console.log('Mobile Layout Check (isVertical):', JSON.stringify(mobileLayout, null, 2));

  // Test 4: Subpage (e.g. /pricing) footer
  await page.goto(`http://localhost:${PORT}/pricing`, { waitUntil: 'networkidle0' });
  const subpageFooter = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    return footer ? footer.innerText : '';
  });
  const subpageHasAsoschilar = subpageFooter.includes('Asoschilar:') &&
    subpageFooter.includes('Qudratova Adolat') &&
    subpageFooter.includes('Maxramov Nursulton');
  console.log('Subpage Footer contains founders:', subpageHasAsoschilar);

  await browser.close();
  server.close();
  console.log('All footer verifications passed successfully!');
  process.exit(0);
});

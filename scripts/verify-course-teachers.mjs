import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import path from 'path';
import { createServer } from 'http';
import fs from 'fs';

const PORT = 4185;
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

  // 1. Landing Page Course Cards
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0' });

  const landingCards = await page.evaluate(() => {
    const section = document.getElementById('kurslar');
    if (!section) return null;
    const articles = Array.from(section.querySelectorAll('article'));
    return articles.map(art => {
      const title = art.querySelector('h3')?.textContent?.trim();
      const text = art.innerText;
      return {
        title,
        hasUstozlar: text.includes('Ustozlar:'),
        hasInformatikaTeachers: text.includes('Qudratova Adolat & Maxramov Nursulton'),
        hasTarixTeacher: text.includes('Xamrayeva Mahliyo'),
        fullTextSnippet: text.slice(-200)
      };
    });
  });

  console.log('Landing Course Cards Check:', JSON.stringify(landingCards, null, 2));

  // Screenshot #kurslar section on Desktop
  const kurslarEl = await page.$('#kurslar');
  if (kurslarEl) {
    await kurslarEl.screenshot({ path: '/tmp/kurslar_desktop_light.png' });
  }

  // Dark mode test
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 200));
  if (kurslarEl) {
    await kurslarEl.screenshot({ path: '/tmp/kurslar_desktop_dark.png' });
  }

  // Mobile test 375x812
  await page.setViewport({ width: 375, height: 812 });
  await new Promise(r => setTimeout(r, 200));
  if (kurslarEl) {
    await kurslarEl.screenshot({ path: '/tmp/kurslar_mobile_dark.png' });
  }

  // 2. Course Catalog Page
  await page.goto(`http://localhost:${PORT}/courses`, { waitUntil: 'networkidle0' });
  const catalogText = await page.evaluate(() => document.body.innerText);
  console.log('Catalog Page has Ustozlar:', catalogText.includes('Ustozlar:'));
  console.log('Catalog Page has Qudratova Adolat & Maxramov Nursulton:', catalogText.includes('Qudratova Adolat & Maxramov Nursulton'));

  await browser.close();
  server.close();
  console.log('Course teachers verification complete!');
  process.exit(0);
});

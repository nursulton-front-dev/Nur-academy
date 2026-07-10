// Post-build prerender for PUBLIC routes only.
//
// Serves the freshly built dist/ from an in-memory SPA shell, drives a headless
// Chrome over each public route, and writes the fully-rendered DOM back to
// dist/<route>/index.html. Crawlers then receive real HTML (H1, copy, JSON-LD,
// per-page canonical from useSeo) instead of an empty <div id="root">.
//
// Auth-gated routes are intentionally excluded — this only touches marketing
// pages. The client bundle still boots normally on top of the snapshot
// (createRoot re-mounts), so app behaviour, routing and Supabase are untouched.
//
// Chrome resolution:
//   • Local: set PUPPETEER_EXECUTABLE_PATH to the system Chrome.
//   • Vercel/CI: leave it unset — puppeteer uses the Chromium it downloads on
//     `npm install`.
// A launch failure is a loud warning, NOT a build failure (never break deploy).

import { createServer } from 'node:http';
import { readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const DIST = resolve(fileURLToPath(new URL('../dist', import.meta.url)));

// PUBLIC routes only. Keep in sync with the public <Route>s in src/App.tsx.
const ROUTES = ['/', '/courses', '/kurs/attestatsiya', '/pricing', '/login', '/signup'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

// Pristine SPA shell captured once, so overwriting dist/index.html mid-run does
// not affect how later routes are served.
const shell = readFileSync(join(DIST, 'index.html'));

function startServer() {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const filePath = join(DIST, urlPath);

    // Serve real static assets (JS/CSS/images) with correct MIME.
    if (urlPath !== '/' && existsSync(filePath) && statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(readFileSync(filePath));
      return;
    }

    // Everything else → SPA shell (client router renders the route).
    res.writeHead(200, { 'Content-Type': MIME['.html'] });
    res.end(shell);
  });
  return new Promise((res) => {
    server.listen(0, '127.0.0.1', () => res(server));
  });
}

function outputPath(route) {
  return route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
}

async function run() {
  const server = await startServer();
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
  } catch (err) {
    server.close();
    console.warn('\n⚠️  [prerender] Could not launch Chrome — SKIPPING prerender.');
    console.warn('   The app still ships as a working SPA, but public routes are not pre-rendered.');
    console.warn('   ' + (err instanceof Error ? err.message : String(err)) + '\n');
    return; // exit 0 — never break the deploy
  }

  let ok = 0;
  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(base + route, { waitUntil: 'networkidle2', timeout: 20000 });
      // Wait until the client app has mounted real content into #root.
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return !!root && root.innerText.trim().length > 150;
        },
        { timeout: 15000 }
      );
      await new Promise((r) => setTimeout(r, 400)); // settle useSeo + late paints

      const html = await page.evaluate(() => '<!doctype html>\n' + document.documentElement.outerHTML);
      const out = outputPath(route);
      mkdirSync(join(out, '..'), { recursive: true });
      writeFileSync(out, html, 'utf-8');
      console.log(`✓ [prerender] ${route.padEnd(10)} → ${out.replace(DIST, 'dist')} (${html.length} bytes)`);
      ok++;
    } catch (err) {
      console.warn(`⚠️  [prerender] ${route} failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log(`[prerender] done — ${ok}/${ROUTES.length} routes rendered.`);
}

run().catch((err) => {
  console.warn('⚠️  [prerender] Unexpected error, skipping:', err);
  process.exit(0); // never break the build
});

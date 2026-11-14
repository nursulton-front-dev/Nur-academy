// Post-build prerender for PUBLIC routes only.
//
// Serves the freshly built dist/ from an in-memory SPA shell, drives a headless
// Chromium over each public route, and writes the fully-rendered DOM back to
// dist/<route>/index.html. Crawlers then receive real HTML (H1, copy, JSON-LD,
// per-page canonical from useSeo) instead of an empty <div id="root">.
//
// Auth-gated and sensitive routes are strictly excluded — only public marketing
// and entry pages are prerendered. Prerendered HTML contains zero user data.
//
// Chrome resolution:
//   • System Chrome: PUPPETEER_EXECUTABLE_PATH (e.g. local dev / custom CI).
//   • Serverless / Vercel fallback: @sparticuz/chromium via chromium.executablePath().
//
// Failure policy:
//   • VERCEL_ENV === 'production': FAIL the build with non-zero exit code so
//     un-prerendered or broken HTML is never deployed silently to production.
//   • Preview / local dev: print a loud warning and continue (exit 0).

import { createServer } from 'node:http';
import { readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const DIST = resolve(fileURLToPath(new URL('../dist', import.meta.url)));

// STRICTLY PUBLIC routes only. Private routes (/dashboard, /admin, /kurs/:slug/dars/*,
// /kurs/:slug/imtihon/*, etc.) must NEVER be prerendered.
const ROUTES = ['/', '/courses', '/kurs/attestatsiya', '/pricing', '/login', '/signup'];

const isProdVercel = process.env.VERCEL_ENV === 'production';

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

// Pristine SPA shell captured once
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

    // Everything else -> SPA shell
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
  const isCustomPath = Boolean(process.env.PUPPETEER_EXECUTABLE_PATH);

  try {
    const executablePath = isCustomPath
      ? process.env.PUPPETEER_EXECUTABLE_PATH
      : await chromium.executablePath();

    browser = await puppeteer.launch({
      headless: isCustomPath ? true : chromium.headless,
      executablePath,
      args: isCustomPath
        ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        : chromium.args,
      defaultViewport: isCustomPath ? { width: 1280, height: 800 } : chromium.defaultViewport
    });
  } catch (err) {
    server.close();
    const errMsg = err instanceof Error ? err.message : String(err);
    if (isProdVercel) {
      console.error(`\n❌ [prerender] FATAL: Could not launch Chrome in production: ${errMsg}`);
      console.error('Failing build because VERCEL_ENV=production.\n');
      process.exit(1);
    }
    console.warn('\n⚠️  [prerender] Could not launch Chrome — SKIPPING prerender.');
    console.warn(`   ${errMsg}\n`);
    return;
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
          return !!root && root.innerText.trim().length > 100;
        },
        { timeout: 15000 }
      );
      await new Promise((r) => setTimeout(r, 400)); // settle useSeo + late paints

      const html = await page.evaluate(() => '<!doctype html>\n' + document.documentElement.outerHTML);

      // Verify no sensitive tokens leaked into prerendered HTML
      if (html.includes('sb-') && (html.includes('auth-token') || html.includes('access_token'))) {
        throw new Error(`Prerendered page ${route} contained sensitive auth token pattern`);
      }

      const out = outputPath(route);
      mkdirSync(join(out, '..'), { recursive: true });
      writeFileSync(out, html, 'utf-8');
      console.log(`✓ [prerender] ${route.padEnd(20)} → ${out.replace(DIST, 'dist')} (${html.length} bytes)`);
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

  if (ok < ROUTES.length) {
    const failMsg = `[prerender] Failed to render all routes: only ${ok}/${ROUTES.length} succeeded.`;
    if (isProdVercel) {
      console.error(`\n❌ [prerender] FATAL: ${failMsg}`);
      console.error('Failing build because VERCEL_ENV=production.\n');
      process.exit(1);
    } else {
      console.warn(`⚠️  ${failMsg}`);
    }
  }
}

run().catch((err) => {
  console.error('❌ [prerender] Unexpected failure:', err);
  if (isProdVercel) {
    process.exit(1);
  }
  process.exit(0);
});

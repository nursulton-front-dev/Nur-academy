// Central SEO configuration.
//
// NOTE: SITE_URL is the production origin used for absolute canonical/OG URLs.
// Override it per-environment with VITE_SITE_URL; the default is the intended
// production domain (change it once the real domain is live).
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')
  || 'https://nuracademy.uz';

export const SITE_NAME = 'Nur Academy';

// Default OG/Twitter preview image. A working raster lives at this path today;
// a dedicated branded 1200x630 source is at /og-cover.svg (export to PNG and
// point DEFAULT_OG_IMAGE here for the ideal preview).
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/dashboard-hero.png`;

// Platform-level default (brand). Used by the home page, the student cabinet and
// any page that doesn't set its own meta. Kept course-agnostic on purpose — the
// platform is bigger than a single course. Course pages override this with their
// own (search-optimised) meta via `courseSeo()`.
export const DEFAULT_SEO = {
  title: 'Nur Academy — oʻqituvchilar uchun taʼlim platformasi',
  description:
    'Nur Academy — oʻqituvchilar uchun zamonaviy onlayn taʼlim platformasi. Video darslar, testlar, mock imtihonlar va AI mentor bilan kasbiy tayyorgarlik. Birinchi kurs: informatika attestatsiyasi.',
};

/**
 * Per-course SEO. The attestatsiya course KEEPS the "informatika attestatsiya"
 * search keyword in its title/description — that's how teachers find it on
 * Google. Other courses fall back to their DB title.
 *
 * Note: these refine the browser tab + JS-aware crawlers (Google). Non-JS
 * crawlers (Telegram, etc.) only read the static tags in index.html.
 */
export function courseSeo(
  slug: string | undefined,
  dbTitle: string | undefined
): { title: string; description: string; rawTitle: boolean } {
  if (slug === 'attestatsiya') {
    return {
      title: 'Informatika attestatsiyasiga tayyorgarlik | Nur Academy',
      description:
        'Informatika oʻqituvchilari attestatsiyasiga tayyorgarlik: video darslar, mavzu testlari, mock imtihonlar, diagnostika va AI mentor. Nur Academy platformasi.',
      rawTitle: true,
    };
  }
  return {
    title: dbTitle || 'Kurs',
    description:
      `${dbTitle || 'Kurs'} — Nur Academy platformasida oʻqing: video darslar, testlar va imtihonlar.`,
    rawTitle: false,
  };
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

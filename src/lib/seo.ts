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

export const DEFAULT_SEO = {
  title: 'Nur Academy — Informatika oʻqituvchilari attestatsiyaga tayyorgarlik',
  description:
    'Informatika oʻqituvchilari uchun attestatsiyaga tayyorgarlik platformasi: video darslar, testlar, mock imtihonlar va AI mentor.',
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

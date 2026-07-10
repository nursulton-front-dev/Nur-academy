import { useEffect } from 'react';

// Single source of truth for canonical origin + site-wide SEO defaults.
// Keep these in sync with the static fallbacks in index.html.
export const SITE_URL = 'https://nuracademy.uz';
export const SITE_NAME = 'Nur Academy';
export const DEFAULT_TITLE = 'Nur Academy — attestatsiyaga tayyorgarlik platformasi';
export const DEFAULT_DESCRIPTION =
  'Nur Academy — informatika oʻqituvchilari uchun onlayn tayyorgarlik platformasi. ' +
  'Diagnostika, video darslar, testlar va mock imtihonlar — barchasi bir tizimda, oʻzbek tilida.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-cover.png`;

interface SeoOptions {
  /** Page-specific title. Site name is appended automatically. Omit for the home page. */
  title?: string;
  description?: string;
  /** Canonical path, e.g. "/courses". Defaults to the current pathname. */
  path?: string;
  image?: string;
  /** Exclude from indexing (rare for public pages). */
  noIndex?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Imperatively syncs document title, description, canonical and OG/Twitter tags
 * for a public page. Lightweight replacement for react-helmet — no provider,
 * no extra dependency. Crawlers that render JS (Googlebot) and the Stage 5
 * prerender both pick up the resulting DOM.
 */
export function useSeo({ title, description, path, image, noIndex }: SeoOptions = {}): void {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description ?? DEFAULT_DESCRIPTION;
    const canonicalPath = path ?? window.location.pathname;
    const canonical = `${SITE_URL}${canonicalPath}`;
    const ogImage = image ?? DEFAULT_OG_IMAGE;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    upsertCanonical(canonical);

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', ogImage);

    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', ogImage);
  }, [title, description, path, image, noIndex]);
}

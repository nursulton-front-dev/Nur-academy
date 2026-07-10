import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, DEFAULT_OG_IMAGE, DEFAULT_SEO, absoluteUrl } from '../lib/seo';

interface SeoProps {
  /** Page <title>. A " — Nur Academy" suffix is added unless `rawTitle`. */
  title?: string;
  description?: string;
  /** OG/Twitter image (absolute URL or site-relative path). */
  image?: string;
  /** og:type — "website" (default) or "article". */
  type?: 'website' | 'article';
  /** Canonical path; defaults to the current route. */
  canonicalPath?: string;
  /** Use the title verbatim (no site-name suffix). */
  rawTitle?: boolean;
}

/**
 * Imperative, dependency-free head manager for our SPA.
 *
 * Why not react-helmet-async: it peers on React 18 and is unmaintained for
 * React 19. This hook upserts the same tags react-helmet would, works across
 * client-side route changes, and is read by JS-rendering crawlers (Google).
 *
 * Telegram & other non-JS crawlers read the STATIC tags in index.html — those
 * are the shared-link defaults; this component refines per-page metadata for
 * the browser tab and JS-aware crawlers.
 */
export function Seo({ title, description, image, type = 'website', canonicalPath, rawTitle }: SeoProps) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = !title
      ? DEFAULT_SEO.title
      : rawTitle
        ? title
        : `${title} — ${SITE_NAME}`;
    const desc = description || DEFAULT_SEO.description;
    const img = image ? absoluteUrl(image) : DEFAULT_OG_IMAGE;
    const url = absoluteUrl(canonicalPath ?? location.pathname);

    document.title = fullTitle;

    upsertMeta('name', 'description', desc);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', img);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', img);
    upsertCanonical(url);
  }, [title, description, image, type, canonicalPath, rawTitle, location.pathname]);

  return null;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

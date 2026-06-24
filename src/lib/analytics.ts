// Analytics loader — GA4 + Yandex Metrica
//
// Configure via .env (or Vercel / hosting env panel):
//   VITE_GA4_ID            = G-XXXXXXXXXX
//   VITE_YANDEX_METRICA_ID = 12345678
//
// If an ID is absent the corresponding script is simply not injected —
// no errors, no placeholder network requests.

const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;
const YM_ID = import.meta.env.VITE_YANDEX_METRICA_ID as string | undefined;

function injectScript(src: string, id: string) {
  if (document.getElementById(id)) return; // already loaded
  const s = document.createElement('script');
  s.id = id;
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

function injectInlineScript(id: string, code: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.textContent = code;
  document.head.appendChild(s);
}

export function loadAnalytics() {
  // ── GA4 ───────────────────────────────────────────────────────────────────
  if (GA4_ID) {
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`, 'ga4-loader');
    injectInlineScript('ga4-init', `
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', '${GA4_ID}', { send_page_view: false });
    `);
  }

  // ── Yandex Metrica ───────────────────────────────────────────────────────
  if (YM_ID) {
    injectInlineScript('ym-init', `
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        k=e.createElement(t),a=e.getElementsByTagName(t)[0];
        k.async=1;k.src=r;a.parentNode.insertBefore(k,a)
      })(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
      ym(${YM_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});
    `);
  }
}

/** Fire a GA4 page_view — call on every route change. */
export function trackPageView(path: string) {
  if (!GA4_ID) return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.('event', 'page_view', { page_path: path });
}

/** Fire a Yandex Metrica hit — call on every route change. */
export function trackYmHit(path: string) {
  if (!YM_ID) return;
  const w = window as unknown as { ym?: (id: number, method: string, url: string) => void };
  w.ym?.(Number(YM_ID), 'hit', path);
}

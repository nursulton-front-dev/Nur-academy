import React, { useId } from 'react';

/**
 * Uzbek ornament accents for the "milliy zamonaviy" look.
 * Colours come from theme tokens, so both light and dark themes work.
 */

/** Islimi vine with gold quatrefoils — sits in the top-right corner of a deep emerald card. */
export function IslimiCorner({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 120"
      className={`pointer-events-none absolute right-0 top-0 ${className}`}
    >
      <g fill="none" stroke="var(--theme-ornament-stem)" strokeWidth="5" strokeLinecap="round">
        <path d="M10 6 C40 10 52 36 80 30 C100 26 104 6 128 10" />
        <path d="M128 10 C150 14 150 44 176 42 C196 40 204 22 220 26" />
        <path d="M150 116 C146 92 166 80 186 86 C204 92 210 70 220 64" />
        <path d="M96 28 C92 50 112 64 132 58" />
      </g>
      <g fill="var(--theme-ornament-leaf)">
        <path d="M44 18 C50 6 66 8 64 20 C54 24 48 24 44 18 Z" />
        <path d="M96 38 C108 34 116 44 108 54 C100 52 96 46 96 38 Z" />
        <path d="M192 60 C204 54 214 64 206 74 C198 72 192 68 192 60 Z" />
        <path d="M168 26 C172 14 186 14 186 26 C178 30 172 30 168 26 Z" />
      </g>
      <g transform="translate(160 64)">
        <path
          d="M0 -34 C10 -22 10 -12 0 -6 C-10 -12 -10 -22 0 -34 Z M0 34 C10 22 10 12 0 6 C-10 12 -10 22 0 34 Z M-34 0 C-22 10 -12 10 -6 0 C-12 -10 -22 -10 -34 0 Z M34 0 C22 10 12 10 6 0 C12 -10 22 -10 34 0 Z"
          fill="var(--theme-ornament)"
        />
        <rect x="-7" y="-7" width="14" height="14" fill="var(--theme-deep)" transform="rotate(45)" />
        <circle r="4" fill="var(--theme-ornament)" />
      </g>
      <path
        transform="translate(84 104)"
        d="M0 -14 C5 -9 5 -4 0 -2 C-5 -4 -5 -9 0 -14 Z M0 14 C5 9 5 4 0 2 C-5 4 -5 9 0 14 Z M-14 0 C-9 5 -4 5 -2 0 C-4 -5 -9 -5 -14 0 Z M14 0 C9 5 4 5 2 0 C4 -5 9 -5 14 0 Z"
        fill="var(--theme-ornament)"
      />
    </svg>
  );
}

/** Majolica tile corner with a scalloped edge — for light cream cards and empty states. */
export function TileCorner({ className = '', side = 'left' }: { className?: string; side?: 'left' | 'right' }) {
  const id = useId().replace(/:/g, '');
  const edge =
    'C162 6 160 18 150 22 C140 26 134 22 128 30 C122 38 128 46 118 52 C108 58 100 52 92 60 C84 68 90 78 80 84 C70 90 62 84 54 92 C46 100 52 110 42 116 C32 122 24 116 16 124 C8 132 10 146 0 156';
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 172 156"
      className={`pointer-events-none absolute top-0 ${side === 'left' ? 'left-0' : 'right-0 -scale-x-100'} ${className}`}
    >
      <defs>
        <pattern id={`tile-${id}`} width="34" height="34" patternUnits="userSpaceOnUse">
          <rect width="34" height="34" fill="var(--theme-tile)" />
          <path
            d="M17 4 C22 10 22 14 17 17 C12 14 12 10 17 4 Z M17 30 C22 24 22 20 17 17 C12 20 12 24 17 30 Z M4 17 C10 22 14 22 17 17 C14 12 10 12 4 17 Z M30 17 C24 22 20 22 17 17 C20 12 24 12 30 17 Z"
            fill="none"
            stroke="var(--theme-tile-line)"
            strokeWidth="1.6"
          />
          <circle cx="17" cy="17" r="2.4" fill="var(--theme-tile-line)" />
        </pattern>
      </defs>
      <path d={`M0 0 H172 ${edge} Z`} fill={`url(#tile-${id})`} />
      <path d={`M172 0 ${edge}`} fill="none" stroke="var(--theme-tile-line)" strokeWidth="2" />
    </svg>
  );
}

/** Stacked note cards with a bookmark and pencil — empty-state illustration for notes. */
export function NotesIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 250" role="img" aria-label="Konspekt kartochkalari va qalam" className={className}>
      <ellipse cx="170" cy="216" rx="150" ry="18" fill="var(--theme-ornament)" opacity="0.28" />
      <rect x="34" y="60" width="200" height="140" rx="12" transform="rotate(-6 120 120)" fill="var(--theme-cream)" stroke="var(--theme-text-primary)" strokeWidth="2.4" />
      <rect x="56" y="62" width="206" height="142" rx="12" transform="rotate(-3 150 120)" fill="var(--theme-cream)" stroke="var(--theme-text-primary)" strokeWidth="2.4" />
      <rect x="80" y="66" width="214" height="148" rx="12" fill="var(--theme-surface)" stroke="var(--theme-text-primary)" strokeWidth="2.4" />
      <path d="M248 66 V102 L258 94 L268 102 V66 Z" fill="#F5A623" stroke="var(--theme-text-primary)" strokeWidth="2" />
      <path d="M112 118 H238 M112 146 H252 M112 174 H236" stroke="var(--theme-text-muted)" strokeWidth="3" strokeLinecap="round" />
      <g transform="rotate(-38 300 190)">
        <rect x="230" y="181" width="110" height="18" rx="3" fill="#13705C" stroke="var(--theme-text-primary)" strokeWidth="2" />
        <rect x="326" y="181" width="16" height="18" rx="3" fill="#F5A623" stroke="var(--theme-text-primary)" strokeWidth="2" />
        <path d="M230 181 L206 190 L230 199 Z" fill="#E9D2A6" stroke="var(--theme-text-primary)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M214 187 L206 190 L214 193 Z" fill="var(--theme-text-primary)" />
      </g>
    </svg>
  );
}

/** Mint number badge ("01") used in module and step lists. */
export function NumberBadge({ n, className = '' }: { n: number | string; className?: string }) {
  const label = typeof n === 'number' ? String(n).padStart(2, '0') : n;
  return (
    <span
      className={`inline-grid place-items-center w-10 h-7 shrink-0 rounded-md bg-mint text-on-mint font-bold text-[15px] tabular-nums ${className}`}
    >
      {label}
    </span>
  );
}

export function SectionChip({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[10px] bg-mint-strong px-4 py-1.5 text-[13px] font-extrabold uppercase tracking-[0.04em] text-on-mint">
      {icon}
      {children}
    </span>
  );
}

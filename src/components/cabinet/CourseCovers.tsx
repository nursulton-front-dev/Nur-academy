import React from 'react';

interface CoverProps {
  className?: string;
}

/**
 * Informatika Poster Decorative Artwork SVG
 * Features:
 *  - Large cream-colored code symbol: `</>`
 *  - Teal geometric angled ornament / polygonal grid
 *  - Small vivid orange accent square
 * Designed to sit on the right of the dark-teal horizontal poster and bleed past the edges.
 */
export function InformatikaPosterArtSvg({ className = 'w-full h-full' }: CoverProps) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Informatika dasturlash ramzi va geometrik bezak"
    >
      <defs>
        <linearGradient id="teal-poly-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0D9488" stopOpacity="0.1" />
        </linearGradient>

        <linearGradient id="teal-poly-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0F766E" stopOpacity="0.05" />
        </linearGradient>

        <linearGradient id="cream-code" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF8" />
          <stop offset="100%" stopColor="#FAF1E0" />
        </linearGradient>

        <filter id="cream-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#042020" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Teal Geometric Ornament (Lattice, Angled Facets, Polygonal Lines) */}
      <g opacity="0.85">
        {/* Background angled polygon facets */}
        <polygon
          points="180,-20 340,30 290,180 140,110"
          fill="url(#teal-poly-1)"
        />
        <polygon
          points="220,60 360,110 320,240 180,190"
          fill="url(#teal-poly-2)"
        />

        {/* Diagonal geometric grid lines */}
        <line x1="120" y1="-20" x2="320" y2="180" stroke="#14B8A6" strokeWidth="1.2" strokeOpacity="0.25" />
        <line x1="160" y1="-20" x2="360" y2="180" stroke="#14B8A6" strokeWidth="1.5" strokeOpacity="0.35" />
        <line x1="200" y1="-20" x2="400" y2="180" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.2" />

        <line x1="300" y1="-20" x2="100" y2="180" stroke="#2DD4BF" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" />
        <line x1="340" y1="20" x2="140" y2="220" stroke="#2DD4BF" strokeWidth="1.2" strokeOpacity="0.25" strokeDasharray="4 4" />

        {/* Subtle decorative nodes */}
        <circle cx="210" cy="30" r="3" fill="#2DD4BF" fillOpacity="0.6" />
        <circle cx="300" cy="110" r="3" fill="#2DD4BF" fillOpacity="0.5" />
        <circle cx="170" cy="150" r="2.5" fill="#14B8A6" fillOpacity="0.4" />
      </g>

      {/* Large Cream Code Symbol: < / > */}
      <g filter="url(#cream-glow)">
        {/* Opening Bracket < */}
        <path
          d="M 115 65 L 68 110 L 115 155"
          stroke="url(#cream-code)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Slash / */}
        <line
          x1="158"
          y1="50"
          x2="128"
          y2="170"
          stroke="url(#cream-code)"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Closing Bracket > */}
        <path
          d="M 172 65 L 219 110 L 172 155"
          stroke="url(#cream-code)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Small Vivid Orange Accent Square */}
      <g transform="translate(232, 40) rotate(12)">
        <rect
          x="0"
          y="0"
          width="24"
          height="24"
          rx="5"
          fill="#FF7A00"
          style={{ filter: 'drop-shadow(0 3px 8px rgba(255, 122, 0, 0.45))' }}
        />
        {/* Inner subtle bevel */}
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="3"
          fill="#FF9433"
          fillOpacity="0.3"
        />
      </g>

      {/* Secondary tiny orange accent */}
      <rect
        x="60"
        y="162"
        width="10"
        height="10"
        rx="2.5"
        fill="#FF7A00"
        fillOpacity="0.75"
        transform="rotate(-8 60 162)"
      />
    </svg>
  );
}

/**
 * Geografiya Teal Topographic Map Contour Lines Cover
 * Rich dark-teal background with vivid teal elevation contour curves.
 */
export function GeografiyaTealContourCover({ className = 'w-full h-full' }: CoverProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Geografiya fani muqovasi — biaryo‘z xarita relyef chiziqlari"
    >
      <defs>
        <linearGradient id="geo-teal-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D3F3F" />
          <stop offset="60%" stopColor="#0A3333" />
          <stop offset="100%" stopColor="#062222" />
        </linearGradient>

        <linearGradient id="geo-teal-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#062222" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Dark Teal Base */}
      <rect width="240" height="160" fill="url(#geo-teal-bg)" />
      <rect width="240" height="160" fill="url(#geo-teal-glow)" />

      {/* Topographic Contour Lines in Vivid Teal */}
      <path
        d="M -20 145 C 30 115, 80 155, 140 125 C 190 100, 220 135, 260 110"
        stroke="#2DD4BF"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      <path
        d="M -15 115 C 35 90, 90 130, 145 100 C 195 75, 225 110, 255 85"
        stroke="#2DD4BF"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />
      <path
        d="M -10 85 C 40 65, 95 105, 150 75 C 195 50, 230 85, 255 60"
        stroke="#2DD4BF"
        strokeWidth="1.3"
        strokeOpacity="0.6"
      />

      {/* Primary Peak (Left) */}
      <path
        d="M 22 105 C 42 45, 92 40, 112 75 C 122 95, 82 125, 52 120 C 32 115, 17 120, 22 105 Z"
        stroke="#2DD4BF"
        strokeWidth="1.4"
        strokeOpacity="0.75"
      />
      <path
        d="M 37 90 C 50 55, 84 51, 98 77 C 106 93, 77 110, 56 105 C 44 102, 34 100, 37 90 Z"
        stroke="#5EEAD4"
        strokeWidth="1.5"
        strokeOpacity="0.9"
      />
      <path
        d="M 50 78 C 58 62, 78 60, 86 76 C 92 86, 74 96, 62 92 C 54 90, 48 86, 50 78 Z"
        stroke="#FDFCF8"
        strokeWidth="1.6"
        strokeOpacity="0.95"
        fill="#2DD4BF"
        fillOpacity="0.2"
      />
      <circle cx="68" cy="73" r="2" fill="#FDFCF8" />

      {/* Secondary Peak (Right) */}
      <path
        d="M 125 135 C 145 75, 205 65, 230 105 C 240 125, 210 150, 165 150 C 140 150, 120 145, 125 135 Z"
        stroke="#2DD4BF"
        strokeWidth="1.3"
        strokeOpacity="0.65"
      />
      <path
        d="M 145 118 C 160 83, 198 78, 214 105 C 220 119, 196 135, 172 133 C 156 131, 142 127, 145 118 Z"
        stroke="#5EEAD4"
        strokeWidth="1.4"
        strokeOpacity="0.8"
      />
      <circle cx="180" cy="106" r="1.5" fill="#FDFCF8" />

      {/* Elevation Text Tag */}
      <text
        x="68"
        y="56"
        fill="#5EEAD4"
        fontSize="7"
        fontFamily="sans-serif"
        fontWeight="bold"
        textAnchor="middle"
      >
        ▲ 2 450 m
      </text>

      {/* Compass Rose */}
      <g opacity="0.6" transform="translate(216, 24)">
        <circle cx="0" cy="0" r="8" stroke="#2DD4BF" strokeWidth="0.8" />
        <path d="M 0 -6 L 2.5 0 L 0 6 L -2.5 0 Z" fill="#2DD4BF" />
        <text x="0" y="-8" fill="#5EEAD4" fontSize="5" fontWeight="bold" textAnchor="middle">N</text>
      </g>
    </svg>
  );
}

/**
 * Ona Tili va Adabiyot Orange Tile Aa Cover
 * Vibrant orange tile background with bold, modern Aa typography and accents.
 */
export function OnaTiliOrangeTileCover({ className = 'w-full h-full' }: CoverProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ona tili va adabiyot fani muqovasi — to‘q sariq Aa belgisi"
    >
      <defs>
        <linearGradient id="ona-orange-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF7A00" />
          <stop offset="60%" stopColor="#F56700" />
          <stop offset="100%" stopColor="#D94E00" />
        </linearGradient>

        <linearGradient id="ona-tile-cream" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF2E8" />
        </linearGradient>
      </defs>

      {/* Orange Tile Base */}
      <rect width="240" height="160" fill="url(#ona-orange-bg)" />

      {/* Geometric Tile Grid Accents */}
      <line x1="20" y1="40" x2="220" y2="40" stroke="#FFF" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="6 6" />
      <line x1="20" y1="80" x2="220" y2="80" stroke="#FFF" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="6 6" />
      <line x1="20" y1="120" x2="220" y2="120" stroke="#FFF" strokeOpacity="0.2" strokeWidth="1.2" />

      {/* Stylized Modern Capital Letter "A" */}
      <text
        x="72"
        y="118"
        fill="url(#ona-tile-cream)"
        fontSize="98"
        fontFamily="'Inter', ui-sans-serif, system-ui, sans-serif"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="-3"
        style={{ filter: 'drop-shadow(0 4px 10px rgba(160, 40, 0, 0.35))' }}
      >
        A
      </text>

      {/* Nestled Lowercase Letter "a" */}
      <text
        x="142"
        y="118"
        fill="#FFF9F5"
        fontSize="72"
        fontFamily="'Inter', ui-sans-serif, system-ui, sans-serif"
        fontWeight="800"
        textAnchor="middle"
        style={{ filter: 'drop-shadow(0 3px 6px rgba(160, 40, 0, 0.25))' }}
      >
        a
      </text>

      {/* Typographic Accent / Apostrophe (O‘zbek tili tutuq belgisi) */}
      <path
        d="M 172 65 C 174 62, 178 61, 181 63 C 183 65, 183 68, 180 72 L 174 80 L 171 79 Z"
        fill="#FFFFFF"
        fillOpacity="0.9"
      />

      {/* Subtitle tag */}
      <text
        x="120"
        y="142"
        fill="#FFFFFF"
        fillOpacity="0.75"
        fontSize="7.5"
        fontWeight="700"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="2"
      >
        ONA TILI VA ADABIYOT
      </text>
    </svg>
  );
}

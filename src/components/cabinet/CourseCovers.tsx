import React from 'react';

interface CoverProps {
  className?: string;
}

/**
 * Informatika PCB / Circuit Board Cover
 * Minimalist, high-tech vector illustration featuring a central processor chip,
 * orthogonal circuit traces with 45° bends, and gold/blue solder via pads.
 */
export function InformatikaPcbCover({ className = 'w-full h-full' }: CoverProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Informatika fani muqovasi — bosma plata chizmasi"
    >
      <defs>
        <linearGradient id="inf-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1262F5" />
          <stop offset="65%" stopColor="#0D46B8" />
          <stop offset="100%" stopColor="#082A73" />
        </linearGradient>

        <linearGradient id="inf-chip" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2356" />
          <stop offset="100%" stopColor="#061536" />
        </linearGradient>

        <linearGradient id="inf-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F9D77E" />
          <stop offset="100%" stopColor="#F2B544" />
        </linearGradient>

        {/* Subtle grid pattern */}
        <pattern id="inf-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#60A5FA" fillOpacity="0.18" />
        </pattern>
      </defs>

      {/* Background with tech gradient */}
      <rect width="240" height="160" fill="url(#inf-bg)" />
      <rect width="240" height="160" fill="url(#inf-dots)" />

      {/* Circuit Traces — Top Left */}
      <path
        d="M 85 55 L 60 55 L 40 35 L 20 35"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />
      <circle cx="20" cy="35" r="3" fill="url(#inf-gold)" />
      <circle cx="60" cy="55" r="2" fill="#93C5FD" fillOpacity="0.6" />

      <path
        d="M 85 70 L 50 70 L 30 90 L 15 90"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeOpacity="0.85"
        strokeLinecap="round"
      />
      <circle cx="15" cy="90" r="2.5" fill="#93C5FD" />

      <path
        d="M 100 45 L 100 25 L 85 10 L 45 10"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        strokeLinecap="round"
      />
      <circle cx="45" cy="10" r="2.5" fill="url(#inf-gold)" />

      {/* Circuit Traces — Top Right */}
      <path
        d="M 140 45 L 140 22 L 155 8 L 195 8"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />
      <circle cx="195" cy="8" r="3" fill="url(#inf-gold)" />

      <path
        d="M 155 58 L 180 58 L 205 32 L 225 32"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
      <circle cx="225" cy="32" r="3" fill="#93C5FD" />
      <circle cx="180" cy="58" r="2" fill="url(#inf-gold)" />

      <path
        d="M 155 72 L 190 72 L 210 92 L 230 92"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeOpacity="0.65"
        strokeLinecap="round"
      />
      <circle cx="230" cy="92" r="2.5" fill="url(#inf-gold)" />

      {/* Circuit Traces — Bottom Left */}
      <path
        d="M 85 92 L 65 92 L 45 112 L 45 138 L 30 152"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />
      <circle cx="30" cy="152" r="3" fill="url(#inf-gold)" />
      <circle cx="45" cy="112" r="2" fill="#60A5FA" />

      <path
        d="M 100 115 L 100 135 L 85 150 L 55 150"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeOpacity="0.65"
        strokeLinecap="round"
      />
      <circle cx="55" cy="150" r="2.5" fill="#93C5FD" />

      {/* Circuit Traces — Bottom Right */}
      <path
        d="M 140 115 L 140 132 L 160 152 L 200 152"
        stroke="#93C5FD"
        strokeWidth="1.5"
        strokeOpacity="0.8"
        strokeLinecap="round"
      />
      <circle cx="200" cy="152" r="3" fill="url(#inf-gold)" />

      <path
        d="M 155 95 L 178 95 L 202 120 L 225 120"
        stroke="#60A5FA"
        strokeWidth="1.5"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />
      <circle cx="225" cy="120" r="2.5" fill="url(#inf-gold)" />

      {/* SMT Components */}
      <rect x="52" y="32" width="10" height="6" rx="1.5" fill="#0A2968" stroke="#93C5FD" strokeWidth="1" strokeOpacity="0.8" />
      <rect x="180" y="117" width="10" height="6" rx="1.5" fill="#0A2968" stroke="#F2B544" strokeWidth="1" strokeOpacity="0.8" />

      {/* Central Microprocessor Chip */}
      {/* Chip Pins */}
      {/* Top Pins */}
      <line x1="97" y1="41" x2="97" y2="45" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="108" y1="41" x2="108" y2="45" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="120" y1="41" x2="120" y2="45" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="132" y1="41" x2="132" y2="45" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="143" y1="41" x2="143" y2="45" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Bottom Pins */}
      <line x1="97" y1="115" x2="97" y2="119" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="108" y1="115" x2="108" y2="119" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="120" y1="115" x2="120" y2="119" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="132" y1="115" x2="132" y2="119" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="143" y1="115" x2="143" y2="119" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Left Pins */}
      <line x1="81" y1="57" x2="85" y2="57" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="81" y1="68" x2="85" y2="68" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="81" y1="80" x2="85" y2="80" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="81" y1="92" x2="85" y2="92" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="81" y1="103" x2="85" y2="103" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Right Pins */}
      <line x1="155" y1="57" x2="159" y2="57" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="155" y1="68" x2="159" y2="68" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="155" y1="80" x2="159" y2="80" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="155" y1="92" x2="159" y2="92" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="155" y1="103" x2="159" y2="103" stroke="url(#inf-gold)" strokeWidth="2.5" strokeLinecap="round" />

      {/* Main Chip Body */}
      <rect
        x="85"
        y="45"
        width="70"
        height="70"
        rx="10"
        fill="url(#inf-chip)"
        stroke="#3B82F6"
        strokeWidth="1.5"
      />

      {/* Chip Inner Frame */}
      <rect
        x="96"
        y="56"
        width="48"
        height="48"
        rx="6"
        fill="#081E48"
        stroke="#60A5FA"
        strokeWidth="1"
        strokeDasharray="2 2"
        strokeOpacity="0.7"
      />

      {/* Gold Silicon Die Core */}
      <rect
        x="108"
        y="68"
        width="24"
        height="24"
        rx="4"
        fill="url(#inf-gold)"
        fillOpacity="0.95"
      />

      {/* Microprocessor Core Icon / Stylized Circuit Core */}
      <path
        d="M 114 77 L 126 77 M 120 73 L 120 87 M 116 83 L 124 83"
        stroke="#061A3A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Pin 1 index dot */}
      <circle cx="92" cy="52" r="2" fill="#F2B544" />

      {/* Subtle branding or tech indicator */}
      <text
        x="120"
        y="142"
        fill="#93C5FD"
        fillOpacity="0.45"
        fontSize="7"
        fontWeight="bold"
        fontFamily="monospace"
        textAnchor="middle"
        letterSpacing="2"
      >
        INFORMATIKA
      </text>
    </svg>
  );
}

/**
 * Geografiya Relief / Topographic Contour Lines Cover
 * Sage green organic palette with topographic elevation curves and elevation markers.
 */
export function GeografiyaContourCover({ className = 'w-full h-full' }: CoverProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Geografiya fani muqovasi — relyef chiziqlari"
    >
      <defs>
        <linearGradient id="geo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A7A66" />
          <stop offset="50%" stopColor="#3F6B58" />
          <stop offset="100%" stopColor="#2E5243" />
        </linearGradient>

        <linearGradient id="geo-glow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#A8D5BA" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2E5243" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Sage Green Base */}
      <rect width="240" height="160" fill="url(#geo-bg)" />
      <rect width="240" height="160" fill="url(#geo-glow)" />

      {/* Topographic Contour Curves */}
      {/* Outer subtle contours */}
      <path
        d="M -20 140 C 30 110, 80 150, 140 120 C 190 95, 220 130, 260 105"
        stroke="#E2F1E8"
        strokeWidth="1"
        strokeOpacity="0.25"
      />
      <path
        d="M -15 110 C 35 85, 90 125, 145 95 C 195 70, 225 105, 255 80"
        stroke="#E2F1E8"
        strokeWidth="1"
        strokeOpacity="0.3"
      />
      <path
        d="M -10 80 C 40 60, 95 100, 150 70 C 195 45, 230 80, 255 55"
        stroke="#E2F1E8"
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />

      {/* Primary mountain elevation loops (Left Summit) */}
      <path
        d="M 20 100 C 40 40, 90 35, 110 70 C 120 90, 80 120, 50 115 C 30 110, 15 115, 20 100 Z"
        stroke="#E2F1E8"
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />
      <path
        d="M 35 85 C 48 50, 82 46, 96 72 C 104 88, 75 105, 54 100 C 42 97, 32 95, 35 85 Z"
        stroke="#E2F1E8"
        strokeWidth="1.4"
        strokeOpacity="0.65"
      />
      <path
        d="M 48 74 C 56 58, 76 56, 84 72 C 90 82, 72 92, 60 88 C 52 86, 46 82, 48 74 Z"
        stroke="#E2F1E8"
        strokeWidth="1.5"
        strokeOpacity="0.85"
      />
      <path
        d="M 58 68 C 62 62, 71 61, 74 68 C 76 73, 68 77, 63 75 Z"
        stroke="#FDFCF8"
        strokeWidth="1.5"
        strokeOpacity="0.95"
        fill="#E2F1E8"
        fillOpacity="0.25"
      />
      <circle cx="66" cy="69" r="1.5" fill="#FDFCF8" />

      {/* Secondary Ridge (Right Summit) */}
      <path
        d="M 125 130 C 145 70, 205 60, 230 100 C 240 120, 210 145, 165 145 C 140 145, 120 140, 125 130 Z"
        stroke="#E2F1E8"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />
      <path
        d="M 145 115 C 160 80, 198 75, 214 102 C 220 116, 196 132, 172 130 C 156 128, 142 124, 145 115 Z"
        stroke="#E2F1E8"
        strokeWidth="1.4"
        strokeOpacity="0.6"
      />
      <path
        d="M 162 104 C 172 88, 190 85, 198 102 C 202 110, 188 120, 178 118 C 170 116, 160 112, 162 104 Z"
        stroke="#E2F1E8"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <circle cx="180" cy="103" r="1.5" fill="#FDFCF8" />

      {/* Index elevation labels */}
      <text
        x="66"
        y="53"
        fill="#E2F1E8"
        fillOpacity="0.75"
        fontSize="6.5"
        fontFamily="sans-serif"
        fontWeight="bold"
        textAnchor="middle"
      >
        ▲ 2 450 m
      </text>

      <text
        x="180"
        y="78"
        fill="#E2F1E8"
        fillOpacity="0.65"
        fontSize="6"
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        1 890 m
      </text>

      {/* Compass indicator top right */}
      <g opacity="0.5" transform="translate(216, 22)">
        <circle cx="0" cy="0" r="8" stroke="#E2F1E8" strokeWidth="0.8" />
        <path d="M 0 -6 L 2.5 0 L 0 6 L -2.5 0 Z" fill="#E2F1E8" />
        <text x="0" y="-8" fill="#E2F1E8" fontSize="5" fontWeight="bold" textAnchor="middle">N</text>
      </g>
    </svg>
  );
}

/**
 * Ona Tili va Adabiyot Terracotta Typography Cover
 * Terracotta rich palette with elegant serif letters "Aa" and literary styling.
 */
export function OnaTiliTypographyCover({ className = 'w-full h-full' }: CoverProps) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ona tili va adabiyot fani muqovasi — Aa harflari"
    >
      <defs>
        <linearGradient id="ona-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C45A3E" />
          <stop offset="60%" stopColor="#B34B30" />
          <stop offset="100%" stopColor="#8A341E" />
        </linearGradient>

        <linearGradient id="ona-text" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF9F5" />
          <stop offset="100%" stopColor="#F9DFD2" />
        </linearGradient>
      </defs>

      {/* Terracotta Base */}
      <rect width="240" height="160" fill="url(#ona-bg)" />

      {/* Subtle literary ruled lines in background */}
      <line x1="20" y1="40" x2="220" y2="40" stroke="#FFF" strokeOpacity="0.12" strokeWidth="0.8" strokeDasharray="4 4" />
      <line x1="20" y1="80" x2="220" y2="80" stroke="#FFF" strokeOpacity="0.12" strokeWidth="0.8" strokeDasharray="4 4" />
      <line x1="20" y1="120" x2="220" y2="120" stroke="#FFF" strokeOpacity="0.15" strokeWidth="1" />
      <line x1="20" y1="140" x2="220" y2="140" stroke="#FFF" strokeOpacity="0.08" strokeWidth="0.8" />

      {/* Elegant Stylized Large Serif Letter "A" */}
      <text
        x="68"
        y="120"
        fill="url(#ona-text)"
        fontSize="108"
        fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
        fontWeight="900"
        textAnchor="middle"
        letterSpacing="-4"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(80, 20, 10, 0.35))' }}
      >
        A
      </text>

      {/* Nestled Lowercase Serif Letter "a" */}
      <text
        x="138"
        y="120"
        fill="#F2B544"
        fontSize="78"
        fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        textAnchor="middle"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(80, 20, 10, 0.25))' }}
      >
        a
      </text>

      {/* Decorative Apostrophe / Accent Mark (O‘zbek tili tutuq belgisi / urg‘u) */}
      <path
        d="M 166 65 C 168 62, 172 61, 175 63 C 177 65, 177 68, 174 72 L 168 80 L 165 79 Z"
        fill="#FFF9F5"
        fillOpacity="0.85"
      />

      {/* Feather pen / quill subtle contour flourish */}
      <path
        d="M 180 120 C 195 110, 215 85, 222 55 C 218 72, 205 92, 192 102"
        stroke="#FFF"
        strokeWidth="1.2"
        strokeOpacity="0.3"
        strokeLinecap="round"
      />

      {/* Subtitle label */}
      <text
        x="120"
        y="142"
        fill="#FFF9F5"
        fillOpacity="0.5"
        fontSize="7.5"
        fontWeight="600"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="2.5"
      >
        ONA TILI VA ADABIYOT
      </text>
    </svg>
  );
}

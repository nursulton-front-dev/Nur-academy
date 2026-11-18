import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  imgClassName?: string;
  textClassName?: string;
}

const SIZE_MAP = {
  sm: { img: 'w-7 h-7', text: 'text-base' },
  md: { img: 'w-9 h-9', text: 'text-xl' },
  lg: { img: 'w-11 h-11', text: 'text-2xl' },
  xl: { img: 'w-14 h-14', text: 'text-3xl' },
};

export function BrandLogo({
  size = 'md',
  showText = false,
  className = '',
  imgClassName = '',
  textClassName = '',
}: BrandLogoProps) {
  const config = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/images/nur-logo.webp"
        alt="Nur Academy"
        width={44}
        height={44}
        className={`${config.img} object-contain shrink-0 transition-transform ${imgClassName}`}
        loading="eager"
      />
      {showText && (
        <span
          className={`font-serif font-extrabold tracking-tight text-text-primary ${config.text} ${textClassName}`}
        >
          Nur Academy
        </span>
      )}
    </div>
  );
}

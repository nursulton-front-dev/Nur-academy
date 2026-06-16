// Maps question_bank.domain codes to their Uzbek display labels.
export const DOMAIN_LABELS: Record<string, string> = {
  axborot_savodxonlik: 'Axborot va raqamli savodxonlik',
  kompyuter_office: 'Kompyuter tizimlari va Office',
  mantiq_sanoq: 'Mantiq va sanoq sistemalari',
  dasturlash_mb: "Dasturlash va ma'lumotlar bazasi",
  grafika_veb: 'Grafika va veb-texnologiyalar',
  tarmoqlar: 'Tarmoqlar',
  xavfsizlik: 'Xavfsizlik va raqamli xizmatlar',
  pedagogika: 'Pedagogika va metodika'
};

// Canonical display order of domains.
export const DOMAIN_ORDER: string[] = [
  'axborot_savodxonlik',
  'kompyuter_office',
  'mantiq_sanoq',
  'dasturlash_mb',
  'grafika_veb',
  'tarmoqlar',
  'xavfsizlik',
  'pedagogika'
];

export function domainLabel(code: string): string {
  return DOMAIN_LABELS[code] ?? code;
}

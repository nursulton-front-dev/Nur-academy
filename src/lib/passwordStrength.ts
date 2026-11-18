/**
 * Nur Academy - Client-Side Password Strength Estimator
 *
 * Evaluates password entropy, length, predictability, repetitions,
 * and character variety to provide 4-tier visual feedback in Uzbek Latin.
 *
 * Levels:
 * 0-1: Juda zaif / Zaif (Red)
 * 2:   O‘rtacha (Amber)
 * 3:   Kuchli (Blue)
 * 4:   Juda kuchli (Emerald)
 */

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  labelUz: string;
  colorClass: string;
  barColor: string;
  feedbackUz: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const COMMON_PREDICTABLE_PATTERNS = [
  '123456',
  '12345678',
  '123456789',
  'password',
  'parol123',
  'admin123',
  'qwerty',
  'asdfgh',
  'nuracademy',
  'attestatsiya',
  'o‘qituvchi',
  'oqituvchi',
  'maktab123',
  'toshkent',
  'samarqand'
];

export function estimatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      labelUz: 'Juda zaif',
      colorClass: 'text-red-500',
      barColor: 'bg-red-500',
      feedbackUz: 'Parolni kiriting (kamida 8 ta belgi tavsiya etiladi).',
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasMinLength = length >= 8;

  const lower = password.toLowerCase();

  // Check for common trivial sequences (exact match or simple pattern + 1-3 digits)
  const isPredictable = COMMON_PREDICTABLE_PATTERNS.some((pat) => {
    if (lower === pat) return true;
    if (length <= pat.length + 3 && lower.includes(pat)) return true;
    return false;
  });
  const isRepeated = /(.)\1{3,}/.test(password); // 4+ identical characters in a row

  // Variety count (0-4)
  const varietyCount = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;

  let calculatedScore: 0 | 1 | 2 | 3 | 4 = 1;

  if (length < 6 || (length < 8 && isPredictable)) {
    calculatedScore = 0;
  } else if (length < 8) {
    calculatedScore = 1;
  } else if (isPredictable || isRepeated) {
    calculatedScore = 1;
  } else if (length >= 8 && length < 10) {
    calculatedScore = varietyCount >= 3 ? 2 : 1;
  } else if (length >= 10 && length < 12) {
    calculatedScore = varietyCount >= 3 ? 3 : 2;
  } else if (length >= 12) {
    if (varietyCount >= 3) {
      calculatedScore = varietyCount === 4 ? 4 : 3;
    } else {
      calculatedScore = 2;
    }
  }

  let labelUz = 'Zaif';
  let colorClass = 'text-red-500 dark:text-red-400';
  let barColor = 'bg-red-500';
  let feedbackUz = 'Tavsiya: kamida 8 ta belgi, harf va raqamlardan foydalaning.';

  switch (calculatedScore) {
    case 0:
    case 1:
      labelUz = calculatedScore === 0 ? 'Juda zaif' : 'Zaif';
      colorClass = 'text-red-500 dark:text-red-400';
      barColor = 'bg-red-500';
      feedbackUz = isPredictable
        ? 'Parol oson taxmin qilinadi. Keng tarqalgan so‘zlardan qoching.'
        : 'Parol juda qisqa. Kamida 8 ta belgi va turli xil harflar ishlating.';
      break;
    case 2:
      labelUz = 'O‘rtacha';
      colorClass = 'text-amber-500 dark:text-amber-400';
      barColor = 'bg-amber-500';
      feedbackUz = 'Yaxshi, ammo katta harflar yoki maxsus belgilar qo‘shish tavsiya etiladi.';
      break;
    case 3:
      labelUz = 'Kuchli';
      colorClass = 'text-blue-500 dark:text-blue-400';
      barColor = 'bg-blue-500';
      feedbackUz = 'Kuchli parol! Uni eslab qoling yoki xavfsiz joyda saqlang.';
      break;
    case 4:
      labelUz = 'Juda kuchli';
      colorClass = 'text-emerald-500 dark:text-emerald-400';
      barColor = 'bg-emerald-500';
      feedbackUz = 'A’lo darajadagi ishonchli parol.';
      break;
  }

  return {
    score: calculatedScore,
    labelUz,
    colorClass,
    barColor,
    feedbackUz,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  };
}

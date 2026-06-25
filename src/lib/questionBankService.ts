import { supabase } from './supabase';
import { DOMAIN_ORDER } from './domains';

/**
 * Loads real exam questions from the Supabase question bank
 * (question_bank + question_bank_translations) and shapes them into the format
 * the test runners already consume. Supports both multiple-choice and input
 * (free-text answer) question types.
 *
 * The question bank stores `options` as a jsonb array of { text, is_correct }:
 *  - multiple_choice / Y1 → 4 objects, exactly one is_correct
 *  - input                → 1 object holding the correct answer string
 */

export type BankQuestionType = 'multiple_choice' | 'input';

// Shared question shape consumed by the runners and scoring helpers.
export interface BankQuestion {
  id: string;
  domain: string;
  questionType: BankQuestionType;
  text: string;
  options: string[]; // MC: option labels. input: [] (rendered as a text field).
  correctIndex: number; // MC: index of the correct option. input: -1.
  correctText: string; // input: the expected answer. MC: text of the correct option.
  imageUrl?: string | null; // optional illustration (diagram, code, table) shown with the question.
}

export interface DomainBlueprint {
  domain: string;
  count: number;
}

/* ───────────────────── Blueprints / constants ───────────────────── */

// Diagnostic & mock exam layout: 50 questions weighted across the 8 domains.
// Mirrors the real attestatsiya split (~15 A-block pedagogika + 35 B-block).
// Tweak these counts to re-balance every diagnostic and mock exam at once.
export const DIAGNOSTIC_BLUEPRINT: DomainBlueprint[] = [
  { domain: 'pedagogika', count: 15 },
  { domain: 'axborot_savodxonlik', count: 8 },
  { domain: 'mantiq_sanoq', count: 8 },
  { domain: 'dasturlash_mb', count: 7 },
  { domain: 'kompyuter_office', count: 5 },
  { domain: 'grafika_veb', count: 3 },
  { domain: 'xavfsizlik', count: 2 },
  { domain: 'tarmoqlar', count: 2 }
];

// Default number of questions for a single-domain topic test (Mavzu testlari).
export const TOPIC_TEST_COUNT = 20;

// Maps the legacy module ids (m1..m8) used by topic tests to bank domain codes.
export const MODULE_DOMAIN_MAP: Record<string, string> = {
  m1: 'axborot_savodxonlik',
  m2: 'kompyuter_office',
  m3: 'mantiq_sanoq',
  m4: 'dasturlash_mb',
  m5: 'grafika_veb',
  m6: 'tarmoqlar',
  m7: 'xavfsizlik',
  m8: 'pedagogika'
};

/* ───────────────────── Parsing helpers ───────────────────── */

interface RawOption {
  text?: string;
  is_correct?: boolean;
}

interface BankRow {
  id: string;
  domain: string;
  question_type: string;
  image_url?: string | null;
}

interface TranslationRow {
  question_id: string;
  question_text: string;
  options: unknown;
}

function normaliseType(rawType: string): BankQuestionType {
  return rawType === 'input' ? 'input' : 'multiple_choice';
}

/** Normalises a free-text answer for case/spacing-insensitive comparison. */
export function normaliseInputAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildQuestion(row: BankRow, trans: TranslationRow): BankQuestion | null {
  const questionType = normaliseType(row.question_type);
  const rawOptions = Array.isArray(trans.options) ? (trans.options as RawOption[]) : [];

  if (questionType === 'input') {
    const answer = rawOptions.find((o) => o?.is_correct) ?? rawOptions[0];
    const correctText = String(answer?.text ?? '').trim();
    if (!correctText) return null;
    return {
      id: row.id,
      domain: row.domain,
      questionType: 'input',
      text: trans.question_text,
      options: [],
      correctIndex: -1,
      correctText,
      imageUrl: row.image_url ?? null
    };
  }

  const options: string[] = [];
  let correctIndex = -1;
  rawOptions.forEach((opt, i) => {
    options.push(String(opt?.text ?? ''));
    if (opt?.is_correct === true) correctIndex = i;
  });

  // A multiple-choice question with no usable options is unscoreable — skip it.
  if (options.length === 0) return null;

  return {
    id: row.id,
    domain: row.domain,
    questionType: 'multiple_choice',
    text: trans.question_text,
    options,
    correctIndex,
    correctText: correctIndex >= 0 ? options[correctIndex] : '',
    imageUrl: row.image_url ?? null
  };
}

/** In-place-safe Fisher–Yates shuffle returning a new array. */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ───────────────────── Loading ───────────────────── */

export interface LoadFilters {
  domain?: string; // restrict to a single domain
  difficulty?: string; // restrict to a difficulty (easy | medium | hard | ...)
  limit: number; // maximum number of questions to return
  types?: BankQuestionType[]; // restrict to specific question types
}

/**
 * Loads a random set of questions from the bank matching the given filters.
 * Each call returns a fresh random selection so repeated tests differ.
 * Returns an empty array on failure so callers can fall back gracefully.
 */
export async function loadQuestionsFromBank(filters: LoadFilters): Promise<BankQuestion[]> {
  return loadByBlueprint([{ domain: filters.domain ?? '', count: filters.limit }], {
    difficulty: filters.difficulty,
    types: filters.types
  });
}

interface BlueprintOptions {
  difficulty?: string;
  types?: BankQuestionType[];
}

/**
 * Loads questions for a multi-domain blueprint (e.g. the 50-question diagnostic).
 * Performs a random per-domain sample with no duplicate questions across the set.
 * Two round-trips total: one for candidate rows, one for the chosen translations.
 */
export async function loadByBlueprint(
  blueprint: DomainBlueprint[],
  options: BlueprintOptions = {}
): Promise<BankQuestion[]> {
  const wantedDomains = blueprint.map((b) => b.domain).filter(Boolean);

  try {
    let bankQuery = supabase.from('question_bank').select('id, domain, question_type, image_url');
    if (wantedDomains.length > 0) bankQuery = bankQuery.in('domain', wantedDomains);
    if (options.difficulty) bankQuery = bankQuery.eq('difficulty', options.difficulty);

    const { data: bankData, error: bankErr } = await bankQuery;
    if (bankErr) {
      console.error('loadByBlueprint: question_bank query failed:', bankErr.message);
      return [];
    }

    const rows = (bankData ?? []) as BankRow[];

    // Group candidate rows per domain, honouring any type restriction.
    const allowedTypes = options.types;
    const byDomain = new Map<string, BankRow[]>();
    for (const row of rows) {
      if (allowedTypes && !allowedTypes.includes(normaliseType(row.question_type))) continue;
      const bucket = byDomain.get(row.domain) ?? [];
      bucket.push(row);
      byDomain.set(row.domain, bucket);
    }

    // Sample the requested count from each domain (or all if fewer exist).
    const chosenRows: BankRow[] = [];
    for (const { domain, count } of blueprint) {
      const candidates = domain ? byDomain.get(domain) ?? [] : rows;
      chosenRows.push(...shuffle(candidates).slice(0, count));
    }

    if (chosenRows.length === 0) return [];

    const chosenIds = chosenRows.map((r) => r.id);
    const { data: transData, error: transErr } = await supabase
      .from('question_bank_translations')
      .select('question_id, question_text, options')
      .eq('locale', 'uz')
      .in('question_id', chosenIds);

    if (transErr) {
      console.error('loadByBlueprint: translations query failed:', transErr.message);
      return [];
    }

    const transByQid = new Map<string, TranslationRow>();
    for (const t of (transData ?? []) as TranslationRow[]) {
      transByQid.set(t.question_id, t);
    }

    // Build in blueprint/domain order so the test reads top-down by domain,
    // then shuffle each domain block was already randomised above.
    const built: BankQuestion[] = [];
    for (const row of chosenRows) {
      const trans = transByQid.get(row.id);
      if (!trans) continue;
      const q = buildQuestion(row, trans);
      if (q) built.push(q);
    }

    return built;
  } catch (err) {
    console.error('loadByBlueprint: unexpected error:', err);
    return [];
  }
}

/** Returns true when the user's answer is correct for either question type. */
export function isBankAnswerCorrect(
  question: { questionType?: BankQuestionType; correctIndex: number; correctText?: string },
  answer: number | string | undefined
): boolean {
  if (answer === undefined || answer === null) return false;
  if (question.questionType === 'input') {
    return normaliseInputAnswer(String(answer)) === normaliseInputAnswer(question.correctText ?? '');
  }
  return Number(answer) === question.correctIndex;
}

/** Orders a blueprint by the canonical domain order for display. */
export function orderBlueprint(blueprint: DomainBlueprint[]): DomainBlueprint[] {
  return [...blueprint].sort((a, b) => {
    const ai = DOMAIN_ORDER.indexOf(a.domain);
    const bi = DOMAIN_ORDER.indexOf(b.domain);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

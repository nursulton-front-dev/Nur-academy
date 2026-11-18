/**
 * Geografiya 2026 Comprehensive Integration & Regression Verification Suite
 * Verifies Phases 0 through 7
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { geografiyaService, GEOGRAFIYA_SECTIONS } from '../src/lib/geografiyaService.ts';
import { personalizationService, LEGAL_DISCLAIMER } from '../src/lib/personalizationService.ts';
import { handleCheckAnswer } from '../supabase/functions/check-answer/index.ts';
import { handleExplainMistake, FALLBACK_EXPLANATIONS } from '../supabase/functions/explain-mistake/index.ts';

const ZIP_PATH = path.resolve(process.cwd(), 'Geografiya_2026_kurs_paket_draft.zip');
const EXPECTED_SHA = '35b646c494411f2913be5b69435775d6cf04e148ba40512d865a6ae7313222ee';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  passedTests++;
  console.log(`  ✓ ${message}`);
}

console.log('🧪 Starting Geografiya 2026 Master Verification Suite...\n');

// ── 1. ARCHIVE & PROVENANCE ──
console.log('--- 1. Archive & SHA256 Integrity Verification ---');
const zipBuffer = fs.readFileSync(ZIP_PATH);
const actualSha = crypto.createHash('sha256').update(zipBuffer).digest('hex');
assert(actualSha === EXPECTED_SHA, `Package SHA256 matches exactly: ${actualSha}`);

const stagingData = JSON.parse(fs.readFileSync('src/data/geografiya/stagingCourseData.json', 'utf8'));
const sanitizedQuestions = JSON.parse(fs.readFileSync('src/data/geografiya/sanitizedQuestions.json', 'utf8'));

assert(stagingData.course.id === '0c7e57a7-0000-4000-8000-000000000003', 'Course ID is 0c7e57a7-0000-4000-8000-000000000003');
assert(stagingData.course.slug === 'geografiya', 'Course slug is geografiya');
assert(stagingData.course.exam_duration_minutes === 90, 'Exam duration is 90 minutes');
assert(stagingData.course.is_published === false, 'Course lifecycle is draft / is_published is false');

// ── 2. CURRICULUM & QUESTIONS COUNT ──
console.log('\n--- 2. Curriculum & Bank Counts Verification ---');
const modules = Object.values(stagingData.modules);
assert(modules.length === 8, 'Curriculum has exactly 8 modules (M1-M8)');

const lessons = stagingData.lessons;
assert(lessons.length === 33, 'Curriculum has exactly 33 lessons');

const modDistribution = modules.map(m => m.lessons.length);
assert(JSON.stringify(modDistribution) === JSON.stringify([4, 4, 4, 4, 5, 4, 5, 3]), 'Module lessons distribution is exactly 4/4/4/4/5/4/5/3');

assert(sanitizedQuestions.length === 560, 'Bank contains exactly 560 questions in staging');

const realA = sanitizedQuestions.filter(q => q.pool === 'Real mock' && q.variant === 'A');
const realB = sanitizedQuestions.filter(q => q.pool === 'Real mock' && q.variant === 'B');
const realC = sanitizedQuestions.filter(q => q.pool === 'Real mock' && q.variant === 'C');
assert(realA.length === 50 && realB.length === 50 && realC.length === 50, 'Real mock variants A, B, C have exactly 50 questions each (150 total)');

const oddiyQuestions = sanitizedQuestions.filter(q => q.pool === 'Oddiy mock');
assert(oddiyQuestions.length === 80, 'Oddiy mock has exactly 80 questions (4 variants x 20)');

const mashqQuestions = sanitizedQuestions.filter(q => q.pool === 'Mashq');
assert(mashqQuestions.length === 330, 'Mashq pool has exactly 330 questions (33 lessons x 10)');

// ── 3. REAL MOCK BLUEPRINT QUOTAS ──
console.log('\n--- 3. Real Mock Blueprint Quota Verification ---');
const realASections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => realA.filter(q => q.section === s).length);
assert(JSON.stringify(realASections) === JSON.stringify([5, 6, 5, 5, 6, 2, 3, 3, 5, 10]), 'Real A Section quotas strictly match [5, 6, 5, 5, 6, 2, 3, 3, 5, 10]');

const realBSections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => realB.filter(q => q.section === s).length);
assert(JSON.stringify(realBSections) === JSON.stringify([5, 6, 5, 5, 6, 2, 3, 3, 5, 10]), 'Real B Section quotas strictly match [5, 6, 5, 5, 6, 2, 3, 3, 5, 10]');

const realCSections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => realC.filter(q => q.section === s).length);
assert(JSON.stringify(realCSections) === JSON.stringify([5, 6, 5, 5, 6, 2, 3, 3, 5, 10]), 'Real C Section quotas strictly match [5, 6, 5, 5, 6, 2, 3, 3, 5, 10]');

// Cognition & types
const realAKog = {
  bilish: realA.filter(q => q.cognitive === 'bilish').length,
  qollash: realA.filter(q => q.cognitive === 'qo‘llash').length,
  mulohaza: realA.filter(q => q.cognitive === 'mulohaza').length
};
assert(realAKog.bilish === 8 && realAKog.qollash === 35 && realAKog.mulohaza === 7, 'Real A cognition balance is 8/35/7');

const realATypes = {
  Y1: realA.filter(q => q.question_type === 'Y1').length,
  Y2: realA.filter(q => q.question_type === 'Y2').length,
  Y3: realA.filter(q => q.question_type === 'Y3').length
};
assert(realATypes.Y1 === 43 && realATypes.Y2 === 3 && realATypes.Y3 === 4, 'Real A question types are 43 Y1 / 3 Y2 / 4 Y3');

// ── 4. KEY PRIVACY & ZERO ANSWER LEAKS ──
console.log('\n--- 4. Client Bundle Key Privacy & Sanitization ---');
let keyLeakFound = false;
for (const q of sanitizedQuestions) {
  if (q.correct_index !== undefined || q.correct_code !== undefined || q.is_correct !== undefined) {
    keyLeakFound = true;
    break;
  }
}
assert(!keyLeakFound, 'Zero answer keys or correctness flags present in client questions bundle');

// ── 5. MASHQ EXERCISE EVALUATION & 70% THRESHOLD ──
console.log('\n--- 5. Exercise Runner & 70% Mastery Threshold ---');
// Test 6/10 fails (<70%)
const mock6Answers = {};
const m1d1Qs = geografiyaService.getLessonMashqQuestions('M1-D1');
m1d1Qs.forEach((q, idx) => {
  // First 6 choose correct option ('dalil bilan xulosa chiqarish')
  // Remaining 4 choose incorrect
  const correctOpt = q.options.find(o => o.text.includes('dalil bilan xulosa chiqarish'));
  const wrongOpt = q.options.find(o => !o.text.includes('dalil bilan xulosa chiqarish'));
  mock6Answers[q.id] = (idx < 6 ? correctOpt?.code : wrongOpt?.code) || 'A';
});

const res6 = await geografiyaService.gradeLessonMashq('M1-D1', mock6Answers);
assert(res6.percentage === 60, `6/10 yields 60%`);
assert(res6.passed === false, `6/10 fails 70% threshold (passed = false)`);
assert(res6.repeatRequired === true, `6/10 flags repeatRequired = true`);

// Test 7/10 passes (>=70%)
const mock7Answers = {};
m1d1Qs.forEach((q, idx) => {
  const correctOpt = q.options.find(o => o.text.includes('dalil bilan xulosa chiqarish'));
  const wrongOpt = q.options.find(o => !o.text.includes('dalil bilan xulosa chiqarish'));
  mock7Answers[q.id] = (idx < 7 ? correctOpt?.code : wrongOpt?.code) || 'A';
});

const res7 = await geografiyaService.gradeLessonMashq('M1-D1', mock7Answers);
assert(res7.percentage === 70, `7/10 yields 70%`);
assert(res7.passed === true, `7/10 meets 70% threshold (passed = true)`);
assert(res7.repeatRequired === false, `7/10 repeatRequired = false`);

// ── 6. ODDIY MOCK UNLOCK RULES ──
console.log('\n--- 6. Oddiy Mock Module Pair Gating ---');
const oddiyInitial = geografiyaService.getOddiyMockStatus();
assert(oddiyInitial.find(o => o.variant === 'O1')?.unlocked === false, 'O1 is locked before M1 and M2 are completed');
assert(oddiyInitial.find(o => o.variant === 'O2')?.unlocked === false, 'O2 is locked before M3 and M4 are completed');

// Mark M1 and M2 completed
const m1Lessons = lessons.filter(l => l.module_id === 'M1').map(l => l.id);
const m2Lessons = lessons.filter(l => l.module_id === 'M2').map(l => l.id);
[...m1Lessons, ...m2Lessons].forEach(id => geografiyaService.markLessonCompleted(id));

const oddiyAfterM1M2 = geografiyaService.getOddiyMockStatus();
assert(oddiyAfterM1M2.find(o => o.variant === 'O1')?.unlocked === true, 'O1 unlocks cleanly when M1 and M2 are completed');
assert(oddiyAfterM1M2.find(o => o.variant === 'O2')?.unlocked === false, 'O2 remains locked when M3 and M4 are incomplete');

// ── 7. S1-S10 EXACT LEVEL CLASSIFICATION ──
console.log('\n--- 7. S1-S10 Score Level Classification ---');
assert(personalizationService.classifyLevel(49, 100) === 'past', '49% is classified as past');
assert(personalizationService.classifyLevel(49.99, 100) === 'past', '49.99% is classified as past (strictly < 50%)');
assert(personalizationService.classifyLevel(50, 100) === 'o‘rta', '50.0% is classified as o‘rta');
assert(personalizationService.classifyLevel(79.99, 100) === 'o‘rta', '79.99% is classified as o‘rta (strictly < 80%)');
assert(personalizationService.classifyLevel(80, 100) === 'yuqori', '80.0% is classified as yuqori');
assert(personalizationService.classifyLevel(1, 3) === 'past', '1/3 (33.33%) is classified as past');
assert(personalizationService.classifyLevel(2, 3) === 'o‘rta', '2/3 (66.67%) is classified as o‘rta');

// ── 8. READINESS EVALUATOR & 86+ TAYYOR ──
console.log('\n--- 8. Readiness Evaluator (86+ Tayyor Rule) ---');
// 0 attempts -> boshlang'ich
const read0 = personalizationService.evaluateReadiness([]);
assert(read0.status === 'boshlang‘ich', '0 attempts returns boshlang‘ich');
assert(read0.isTayyor === false, '0 attempts isTayyor = false');

// 1 attempt with 86 -> not tayyor yet (needs 2 fresh)
const read1 = personalizationService.evaluateReadiness([
  { variant: 'A', score: 86, date: '2026-11-18', isFresh: true }
]);
assert(read1.status === 'jarayonda', '1 attempt (86) returns jarayonda (requires 2 consecutive)');
assert(read1.isTayyor === false, '1 attempt isTayyor = false');
assert(read1.observedRange === null, '1 attempt has no false probability range');

// 2 attempts (86, 84) -> not tayyor
const read2a = personalizationService.evaluateReadiness([
  { variant: 'A', score: 86, date: '2026-11-18', isFresh: true },
  { variant: 'B', score: 84, date: '2026-11-18', isFresh: true }
]);
assert(read2a.isTayyor === false, 'Consecutive 86 and 84 is NOT Tayyor');
assert(read2a.observedRange?.min === 84 && read2a.observedRange?.max === 86, 'Observed range is 84 - 86');

// Repeat attempt on same variant A (86, 88 on A) -> not fresh
const readRepeat = personalizationService.evaluateReadiness([
  { variant: 'A', score: 86, date: '2026-11-18', isFresh: true },
  { variant: 'A', score: 88, date: '2026-11-18', isFresh: false } // repeat!
]);
assert(readRepeat.isTayyor === false, 'Repeat attempt on same variant does not qualify for Tayyor');

// 2 consecutive fresh Real attempts on different variants >= 86 -> TAYYOR!
const readTayyor = personalizationService.evaluateReadiness([
  { variant: 'A', score: 88, date: '2026-11-18', isFresh: true },
  { variant: 'B', score: 90, date: '2026-11-18', isFresh: true }
]);
assert(readTayyor.status === 'tayyor', '2 fresh independent Real (A 88, B 90) returns status tayyor');
assert(readTayyor.isTayyor === true, 'isTayyor is true');
assert(readTayyor.disclaimer === LEGAL_DISCLAIMER, 'Mandatory legal disclaimer strictly attached');

// All variants A, B, C used -> exhausted state
const readExhausted = personalizationService.evaluateReadiness([
  { variant: 'A', score: 70, date: '2026-11-18', isFresh: true },
  { variant: 'B', score: 74, date: '2026-11-18', isFresh: true },
  { variant: 'C', score: 80, date: '2026-11-18', isFresh: true }
]);
assert(readExhausted.status === 'variantlar_tugadi', 'Exhausted variants returns variantlar_tugadi');
assert(readExhausted.exhausted === true, 'exhausted flag is true');

// ── 9. AI MENTOR FALLBACKS FOR GEOGRAFIYA ──
console.log('\n--- 9. AI Mentor S1-S10 Fallbacks ---');
for (let s = 1; s <= 10; s++) {
  const code = `S${s}`;
  assert(FALLBACK_EXPLANATIONS[code] !== undefined, `AI Mentor has verified fallback for Section ${code}`);
}

// ── 10. CONTENT ISSUES & AUDIT REESTR ──
console.log('\n--- 10. Content Issues & Review Queue Reestr ---');
const contentIssuesCsv = fs.readFileSync('docs/audits/content_issues.csv', 'utf8');
assert(contentIssuesCsv.includes('ISSUE-POOL-ISOLATION-01'), 'content_issues.csv registers cross-pool clone');
assert(contentIssuesCsv.includes('ISSUE-ASSET-L4'), 'content_issues.csv registers Rasmlar_reestri row 4 issue');
assert(contentIssuesCsv.includes('ISSUE-ASSET-R-05-MAP'), 'content_issues.csv registers R-05/R-06 map cutoff issue');

const reviewQueueCsv = fs.readFileSync('docs/audits/question_review_queue.csv', 'utf8');
const reviewLines = reviewQueueCsv.split('\n').filter(l => l.trim().length > 0);
assert(reviewLines.length === 561, `question_review_queue.csv contains all 560 questions + header (561 lines)`);

console.log('\n======================================================');
console.log(`🎉 ALL ${passedTests} / ${totalTests} INTEGRATION & LOGIC TESTS PASSED!`);
console.log('======================================================');

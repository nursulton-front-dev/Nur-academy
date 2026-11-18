import { mockQuestions, mockTopicTests } from '../data/attestatsiyaMocks';
import { domainLabel } from './domains';
import { supabase } from './supabase';
import { ATTESTATSIYA_COURSE_ID, GEOGRAFIYA_COURSE_ID, GEOGRAFIYA_SLUG } from './courses';
import { geografiyaService } from './geografiyaService';
import {
  loadByBlueprint,
  loadQuestionsFromBank,
  isBankAnswerCorrect,
  DIAGNOSTIC_BLUEPRINT,
  MODULE_DOMAIN_MAP,
  TOPIC_TEST_COUNT,
  type BankQuestion
} from './questionBankService';

export interface ExamQuestion {
  id: string;
  domain: string;
  subdomain?: string;
  question_type: string; // 'multiple_choice' | 'input'
  text: string;
  options: string[];
  order_index: number;
}

export interface ExamAttemptResponse {
  attempt_id: string;
  questions: ExamQuestion[];
}

export interface SubmitAnswerResponse {
  status: string;
}

export interface AnswerReview {
  question_id: string;
  text: string;
  options: string[];
  user_answer: number; // option index, or -1 for input questions
  correct_answer: number; // option index, or -1 for input questions
  is_correct: boolean;
  explanation: string;
  question_type: string;
  user_answer_text?: string; // input questions: what the user typed
  correct_answer_text?: string; // input questions: the expected answer
}

export interface FinishExamResponse {
  attempt_id: string;
  score: number;
  finished_at: string;
  domain_scores: {
    [domain: string]: {
      correct: number;
      total: number;
    };
  };
  answers_review: AnswerReview[];
}

// A stored runner answer is an option index (MC) or a typed string (input).
type ExamAnswer = number | string;

// localStorage namespaces. All swept on logout by Layout.handleSignOut
// (keys prefixed with nur_ / answers_ / result_).
// NOTE: DEF_PREFIX has been completely removed to prevent storing answer keys on the client.
const QUESTIONS_PREFIX = 'nur_exam_q_'; // sanitized question metadata only (no answer keys)
const ANSWERS_PREFIX = 'answers_'; // user answers keyed by question id
const RESULT_PREFIX = 'result_'; // graded result for the result screen (stored only AFTER server grading)
const ATTEMPT_MAP_KEY = 'nur_exam_attempt_map'; // attempt_id -> exam id

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function mapAttempt(attemptId: string, examId: string): void {
  const map = readJson<Record<string, string>>(ATTEMPT_MAP_KEY, {});
  map[attemptId] = examId;
  localStorage.setItem(ATTEMPT_MAP_KEY, JSON.stringify(map));
}

/* ───────────────────── Fallback (bank unavailable) ───────────────────── */

// Adapts the legacy hardcoded mockQuestions into the BankQuestion shape so the
// runner still works if the question bank is unreachable.
function mockFallback(examId: string): BankQuestion[] {
  let pool = mockQuestions;
  if (examId.startsWith('t')) {
    const topic = mockTopicTests.find((t) => t.id === examId);
    if (topic) pool = mockQuestions.filter((q) => q.moduleId === topic.moduleId);
  } else {
    pool = mockQuestions.slice(0, 50);
  }
  return pool.map((q) => ({
    id: q.id,
    domain: q.moduleId,
    questionType: 'multiple_choice' as const,
    text: q.text,
    options: q.options,
    correctIndex: -1,
    correctText: ''
  }));
}

/* ───────────────────── Question selection ───────────────────── */

// Builds a fresh random question set for the given test/exam id.
async function selectQuestions(examId: string): Promise<BankQuestion[]> {
  if (examId.startsWith('t')) {
    // Topic test → N random questions from the mapped domain.
    const topic = mockTopicTests.find((t) => t.id === examId);
    const domain = topic ? MODULE_DOMAIN_MAP[topic.moduleId] : undefined;
    if (domain) {
      const limit = topic?.questionsCount ?? TOPIC_TEST_COUNT;
      const bank = await loadQuestionsFromBank({ domain, limit });
      if (bank.length > 0) return bank;
    }
  } else {
    // Mock exam → full 50-question diagnostic blueprint, fresh each run.
    const bank = await loadByBlueprint(DIAGNOSTIC_BLUEPRINT);
    if (bank.length > 0) return bank;
  }
  return mockFallback(examId);
}

export const attestatsiyaService = {
  /**
   * Starts a fresh exam attempt: draws a new random question set from the bank
   * (so repeated mock exams differ), stores ONLY sanitized questions locally
   * (zero answer keys), and returns the questions.
   */
  async getExamQuestions(examId: string, userId?: string, courseSlug?: string): Promise<ExamAttemptResponse> {
    const isGeografiya = courseSlug === GEOGRAFIYA_SLUG || ['A', 'B', 'C', 'O1', 'O2', 'O3', 'O4'].includes(examId);
    let sanitized: ExamQuestion[] = [];

    if (isGeografiya) {
      let geoQuestions: any[] = [];
      if (['A', 'B', 'C'].includes(examId)) {
        geoQuestions = geografiyaService.getRealMockQuestions(examId as any);
      } else if (['O1', 'O2', 'O3', 'O4'].includes(examId)) {
        geoQuestions = geografiyaService.getOddiyMockQuestions(examId as any);
      }

      sanitized = geoQuestions.map((q, idx) => ({
        id: q.id,
        domain: `S${q.section}`,
        subdomain: q.module_id,
        question_type: q.question_type,
        text: q.stem,
        options: q.options.map((o: any) => `${o.code}) ${o.text}`),
        order_index: idx + 1
      }));
    } else {
      const questions = await selectQuestions(examId);
      sanitized = questions.map((q, idx) => ({
        id: q.id,
        domain: q.domain,
        subdomain: '',
        question_type: q.questionType,
        text: q.text,
        options: q.options,
        order_index: idx + 1
      }));
    }

    const attemptId = crypto.randomUUID();
    const effectiveCourseId = isGeografiya ? GEOGRAFIYA_COURSE_ID : ATTESTATSIYA_COURSE_ID;

    localStorage.setItem(QUESTIONS_PREFIX + attemptId, JSON.stringify(sanitized));
    localStorage.setItem(ANSWERS_PREFIX + attemptId, JSON.stringify({}));
    mapAttempt(attemptId, examId);

    if (userId) {
      supabase.from('exam_attempts').insert({
        id: attemptId,
        user_id: userId,
        course_id: effectiveCourseId,
        exam_id_text: examId,
        question_ids: sanitized.map((q) => q.id),
        started_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.warn('exam_attempts: initial record failed', error.message);
      });
    }

    return { attempt_id: attemptId, questions: sanitized };
  },

  /** Saves a single answer (option index for MC, typed string for input). */
  async submitExamAnswer(
    attemptId: string,
    questionId: string,
    userAnswer: ExamAnswer
  ): Promise<SubmitAnswerResponse> {
    const key = ANSWERS_PREFIX + attemptId;
    const answers = readJson<Record<string, ExamAnswer>>(key, {});
    answers[questionId] = userAnswer;
    localStorage.setItem(key, JSON.stringify(answers));
    return { status: 'saved' };
  },

  /** Grades the attempt on the server via check-answer (batch) and persists to DB. */
  async finishExam(attemptId: string, userId?: string): Promise<FinishExamResponse> {
    const questions = readJson<ExamQuestion[]>(QUESTIONS_PREFIX + attemptId, []);
    const answers = readJson<Record<string, ExamAnswer>>(ANSWERS_PREFIX + attemptId, {});

    let correctCount = 0;
    const domainScores: { [domain: string]: { correct: number; total: number } } = {};
    const answersReview: AnswerReview[] = [];

    // Invoke server-side batch grading
    let serverResults: Record<string, any> = {};
    try {
      const batchPayload = questions.map((q) => ({
        question_id: q.id,
        user_answer: answers[q.id]
      }));

      const { data, error } = await supabase.functions.invoke('check-answer', {
        body: {
          exam_attempt_id: userId ? attemptId : undefined,
          batch: batchPayload
        }
      });

      if (!error && data?.results) {
        serverResults = data.results;
      } else if (userId) {
        throw new Error(error?.message || 'Server tekshiruvi muvaffaqiyatsiz bo‘ldi');
      }
    } catch (err) {
      console.error('attestatsiyaService.finishExam: server check failed', err);
      if (userId) throw err;
    }

    for (const q of questions) {
      const userAnswer = answers[q.id];
      const res = serverResults[q.id];
      const isCorrect = Boolean(res?.is_correct);
      if (isCorrect) correctCount++;

      const domainKey = domainLabel(q.domain);
      if (!domainScores[domainKey]) domainScores[domainKey] = { correct: 0, total: 0 };
      domainScores[domainKey].total += 1;
      if (isCorrect) domainScores[domainKey].correct += 1;

      const isInput = q.question_type === 'input';
      const corrAns = res?.correct_answer;
      answersReview.push({
        question_id: q.id,
        text: q.text,
        options: q.options,
        user_answer: isInput ? -1 : userAnswer !== undefined ? Number(userAnswer) : -1,
        correct_answer: isInput ? -1 : (typeof corrAns === 'number' ? corrAns : -1),
        is_correct: isCorrect,
        explanation: res?.explanation || '',
        question_type: q.question_type,
        user_answer_text: isInput ? String(userAnswer ?? '') : undefined,
        correct_answer_text: isInput ? String(corrAns ?? '') : undefined
      });
    }

    const total = questions.length || 1;
    const finalScore = Math.round((correctCount / total) * 100);

    const result: FinishExamResponse = {
      attempt_id: attemptId,
      score: finalScore,
      finished_at: new Date().toISOString(),
      domain_scores: domainScores,
      answers_review: answersReview
    };

    localStorage.setItem(RESULT_PREFIX + attemptId, JSON.stringify(result));
    localStorage.removeItem(QUESTIONS_PREFIX + attemptId);

    // Result is authoritatively stored on server by check-answer/finish-exam via adminClient.
    // Sync completed attempt state if needed.
    if (userId) {
      supabase.from('exam_attempts').select('id, total_score, finished_at').eq('id', attemptId).maybeSingle().then(({ error }) => {
        if (error) console.warn('exam_attempts: check sync failed', error.message);
      });
    }

    return result;
  },

  /** Retrieves a previously graded result, or null if none is stored. */
  getSavedResult(attemptId: string): FinishExamResponse | null {
    return readJson<FinishExamResponse | null>(RESULT_PREFIX + attemptId, null);
  }
};

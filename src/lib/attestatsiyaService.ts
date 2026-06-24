import { mockQuestions, mockTopicTests } from '../data/attestatsiyaMocks';
import { domainLabel } from './domains';
import { supabase } from './supabase';
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
const DEF_PREFIX = 'nur_exam_def_'; // full question set incl. correct answers
const ANSWERS_PREFIX = 'answers_'; // user answers keyed by question id
const RESULT_PREFIX = 'result_'; // graded result for the result screen
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
    correctIndex: q.correctOptionIndex,
    correctText: q.options[q.correctOptionIndex] ?? ''
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
   * (so repeated mock exams differ), stores the answer key locally for grading,
   * and returns the questions without revealing the correct answers.
   */
  async getExamQuestions(examId: string): Promise<ExamAttemptResponse> {
    const questions = await selectQuestions(examId);
    const attemptId = 'att_' + Math.random().toString(36).substring(2, 11);

    localStorage.setItem(DEF_PREFIX + attemptId, JSON.stringify(questions));
    localStorage.setItem(ANSWERS_PREFIX + attemptId, JSON.stringify({}));
    mapAttempt(attemptId, examId);

    const sanitized: ExamQuestion[] = questions.map((q, idx) => ({
      id: q.id,
      domain: q.domain,
      subdomain: '',
      question_type: q.questionType,
      text: q.text,
      options: q.options,
      order_index: idx + 1
    }));

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

  /** Grades the attempt against the locally stored answer key and persists to DB. */
  async finishExam(attemptId: string, userId?: string): Promise<FinishExamResponse> {
    const questions = readJson<BankQuestion[]>(DEF_PREFIX + attemptId, []);
    const answers = readJson<Record<string, ExamAnswer>>(ANSWERS_PREFIX + attemptId, {});

    let correctCount = 0;
    const domainScores: { [domain: string]: { correct: number; total: number } } = {};
    const answersReview: AnswerReview[] = [];

    for (const q of questions) {
      const userAnswer = answers[q.id];
      const isCorrect = isBankAnswerCorrect(q, userAnswer);
      if (isCorrect) correctCount++;

      const domainKey = domainLabel(q.domain);
      if (!domainScores[domainKey]) domainScores[domainKey] = { correct: 0, total: 0 };
      domainScores[domainKey].total += 1;
      if (isCorrect) domainScores[domainKey].correct += 1;

      const isInput = q.questionType === 'input';
      answersReview.push({
        question_id: q.id,
        text: q.text,
        options: q.options,
        user_answer: isInput ? -1 : userAnswer !== undefined ? Number(userAnswer) : -1,
        correct_answer: q.correctIndex,
        is_correct: isCorrect,
        explanation: '',
        question_type: q.questionType,
        user_answer_text: isInput ? String(userAnswer ?? '') : undefined,
        correct_answer_text: isInput ? q.correctText : undefined
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
    // Question key is no longer needed once graded.
    localStorage.removeItem(DEF_PREFIX + attemptId);

    // Persist to DB so results survive localStorage clears and sync across devices.
    if (userId) {
      const map = readJson<Record<string, string>>(ATTEMPT_MAP_KEY, {});
      const examIdText = map[attemptId] ?? attemptId;
      // Fire-and-forget — don't block the result screen on a network call.
      supabase.from('exam_attempts').insert({
        user_id: userId,
        mock_exam_id: null,
        exam_id_text: examIdText,
        total_score: finalScore,
        max_score: 100,
        finished_at: result.finished_at,
        domain_scores: domainScores,
        answers_review: answersReview,
      }).then(({ error }) => {
        if (error) console.warn('exam_attempts: save failed', error.message);
      });
    }

    return result;
  },

  /** Retrieves a previously graded result, or null if none is stored. */
  getSavedResult(attemptId: string): FinishExamResponse | null {
    return readJson<FinishExamResponse | null>(RESULT_PREFIX + attemptId, null);
  }
};

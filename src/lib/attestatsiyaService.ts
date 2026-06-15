import { supabase } from './supabase';
import { mockQuestions, mockExams, mockExamResult, mockModules } from '../data/attestatsiyaMocks';

export interface ExamQuestion {
  id: string;
  domain: string;
  subdomain?: string;
  question_type: string;
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
  answers_review: Array<{
    question_id: string;
    text: string;
    options: string[];
    user_answer: number;
    correct_answer: number;
    is_correct: boolean;
    explanation: string;
  }>;
}

// Key for local storage mock attempts
const LOCAL_ATTEMPTS_KEY = 'nur_academy_mock_attempts';

export const attestatsiyaService = {
  /**
   * Fetches questions for a mock exam without revealing correct answers.
   * Starts a new exam attempt or resumes an unfinished one.
   */
  async getExamQuestions(mockExamId: string): Promise<ExamAttemptResponse> {
    try {
      // 1. Attempt calling the real Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-exam-questions', {
        body: { mock_exam_id: mockExamId }
      });

      if (!error && data) {
        return data as ExamAttemptResponse;
      }
      console.warn("Using offline fallback for getExamQuestions:", error?.message);
    } catch (e) {
      console.warn("Using offline fallback for getExamQuestions:", e);
    }

    // 2. Offline Mock Simulation
    // Check if we have an active attempt in localStorage
    const attemptsStr = localStorage.getItem(LOCAL_ATTEMPTS_KEY);
    const attempts = attemptsStr ? JSON.parse(attemptsStr) : {};
    
    let attemptId = attempts[mockExamId];
    if (!attemptId) {
      attemptId = 'att_' + Math.random().toString(36).substring(2, 9);
      attempts[mockExamId] = attemptId;
      localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(attempts));
    }

    // Initialize mock selected answers in localStorage for this attempt if not exists
    const answersKey = `answers_${attemptId}`;
    if (!localStorage.getItem(answersKey)) {
      localStorage.setItem(answersKey, JSON.stringify({}));
    }

    // Sanitize questions by stripping out correctOptionIndex and explanation
    const sanitizedQuestions: ExamQuestion[] = mockQuestions.map((q, idx) => ({
      id: q.id,
      domain: q.domain,
      subdomain: q.subdomain,
      question_type: q.question_type,
      text: q.text,
      options: q.options,
      order_index: idx + 1
    }));

    return {
      attempt_id: attemptId,
      questions: sanitizedQuestions
    };
  },

  /**
   * Saves a user answer to a specific question during an active attempt.
   */
  async submitExamAnswer(attemptId: string, questionId: string, userAnswer: number): Promise<SubmitAnswerResponse> {
    try {
      // 1. Attempt calling the real Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('submit-exam-answer', {
        body: { attempt_id: attemptId, question_id: questionId, user_answer: userAnswer }
      });

      if (!error && data) {
        return data as SubmitAnswerResponse;
      }
    } catch (e) {
      // ignore and fallback
    }

    // 2. Offline Mock Simulation
    const answersKey = `answers_${attemptId}`;
    const answers = JSON.parse(localStorage.getItem(answersKey) || '{}');
    answers[questionId] = userAnswer;
    localStorage.setItem(answersKey, JSON.stringify(answers));

    return { status: 'saved' };
  },

  /**
   * Grades the active attempt, saves the result, and returns scores/answers review.
   */
  async finishExam(attemptId: string): Promise<FinishExamResponse> {
    try {
      // 1. Attempt calling the real Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('finish-exam', {
        body: { attempt_id: attemptId }
      });

      if (!error && data) {
        // Save result locally to load in the results screen
        localStorage.setItem(`result_${attemptId}`, JSON.stringify(data));
        return data as FinishExamResponse;
      }
      console.warn("Using offline fallback for finishExam:", error?.message);
    } catch (e) {
      console.warn("Using offline fallback for finishExam:", e);
    }

    // 2. Offline Mock Simulation
    const answersKey = `answers_${attemptId}`;
    const userAnswers = JSON.parse(localStorage.getItem(answersKey) || '{}');

    let correctCount = 0;
    const totalCount = mockQuestions.length;
    const domainScores: { [domain: string]: { correct: number, total: number } } = {};
    const answersReview: any[] = [];

    mockQuestions.forEach(q => {
      const selectedIdx = userAnswers[q.id] !== undefined ? Number(userAnswers[q.id]) : -1;
      const isCorrect = selectedIdx === q.correctOptionIndex;

      if (isCorrect) {
        correctCount++;
      }

      // Track domain scores
      const domain = q.domain || 'Metodika';
      if (!domainScores[domain]) {
        domainScores[domain] = { correct: 0, total: 0 };
      }
      domainScores[domain].total += 1;
      if (isCorrect) {
        domainScores[domain].correct += 1;
      }

      answersReview.push({
        question_id: q.id,
        text: q.text,
        options: q.options,
        user_answer: selectedIdx,
        correct_answer: q.correctOptionIndex,
        is_correct: isCorrect,
        explanation: q.explanation || ''
      });
    });

    const finalScore = Math.round((correctCount / totalCount) * 100);

    const mockResponse: FinishExamResponse = {
      attempt_id: attemptId,
      score: finalScore,
      finished_at: new Date().toISOString(),
      domain_scores: domainScores,
      answers_review: answersReview
    };

    // Store the finished result in localStorage so the results page can retrieve it
    localStorage.setItem(`result_${attemptId}`, JSON.stringify(mockResponse));

    // Clear active attempt pointer
    const attempts = JSON.parse(localStorage.getItem(LOCAL_ATTEMPTS_KEY) || '{}');
    // Find mockExamId matching this attemptId
    const examId = Object.keys(attempts).find(k => attempts[k] === attemptId);
    if (examId) {
      delete attempts[examId];
      localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(attempts));
    }

    return mockResponse;
  },

  /**
   * Retrieves results for a finished attempt.
   */
  getSavedResult(attemptId: string): FinishExamResponse | null {
    const resultStr = localStorage.getItem(`result_${attemptId}`);
    if (resultStr) {
      return JSON.parse(resultStr) as FinishExamResponse;
    }
    
    // Default fallback to mock results if none exists in localStorage
    // map mockModules domains to mockResult
    const domainScores: { [domain: string]: { correct: number, total: number } } = {};
    mockModules.forEach(m => {
      domainScores[m.title] = {
        correct: mockExamResult.moduleScores[m.id]?.correct || 4,
        total: mockExamResult.moduleScores[m.id]?.total || 6
      };
    });

    const reviews = mockQuestions.map(q => ({
      question_id: q.id,
      text: q.text,
      options: q.options,
      user_answer: q.correctOptionIndex, // Simulating correct selection
      correct_answer: q.correctOptionIndex,
      is_correct: true,
      explanation: q.explanation
    }));

    return {
      attempt_id: attemptId,
      score: 78,
      finished_at: new Date().toISOString(),
      domain_scores: domainScores,
      answers_review: reviews
    };
  }
};

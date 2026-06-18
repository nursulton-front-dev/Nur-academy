import { supabase } from './supabase';

export interface LessonQuizAnswerInput {
  userId: string;
  lessonId: string;
  stepId: string | null;
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  attemptCount: number; // tries used on this question (1 = correct on first try)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const lessonQuizService = {
  /**
   * Persists one terminal lesson-quiz outcome for later AI analysis.
   * Fire-and-forget: never throws into the UI. No-ops for non-DB (mock) ids
   * so the legacy single-page lesson quizzes don't pollute the table.
   */
  async recordAnswer(input: LessonQuizAnswerInput): Promise<void> {
    if (!UUID_RE.test(input.lessonId) || !UUID_RE.test(input.questionId)) return;
    try {
      await supabase.from('lesson_quiz_answers').insert({
        user_id: input.userId,
        lesson_id: input.lessonId,
        step_id: input.stepId,
        question_id: input.questionId,
        selected_index: input.selectedIndex,
        is_correct: input.isCorrect,
        attempt_count: input.attemptCount,
      });
    } catch (err) {
      console.error('lessonQuizService.recordAnswer failed:', err);
    }
  },
};

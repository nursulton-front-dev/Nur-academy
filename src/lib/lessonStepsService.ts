import { supabase } from './supabase';

export type StepType = 'text' | 'quiz' | 'common_mistakes' | 'summary' | 'video';

// 'multiple_choice' → pick an option; 'input' → type the answer (number or short text).
export type QuizQuestionType = 'multiple_choice' | 'input';

export interface StepQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  questionType: QuizQuestionType;
}

export interface LessonStep {
  id: string;
  lesson_id: string;
  step_type: StepType;
  order_index: number;
  title: string | null;
  content: string | null;
  questions: StepQuestion[]; // populated for quiz steps
}

interface RawOption {
  text?: string;
  is_correct?: boolean;
}

function parseOptions(raw: unknown): { options: string[]; correctIndex: number } {
  const arr = Array.isArray(raw) ? raw : [];
  const options: string[] = [];
  arr.forEach((item) => {
    if (item && typeof item === 'object') {
      const opt = item as RawOption;
      options.push(String(opt.text ?? ''));
    } else {
      options.push(String(item));
    }
  });
  return { options, correctIndex: -1 };
}

// Per-lesson completed step ids live in localStorage (prefixed nur_ → swept on logout).
// progress PK is (user_id, lesson_id), so it can't hold one row per step; we mirror
// completion locally and upsert the lesson-level progress row when all steps are done.
const stepKey = (lessonId: string) => `nur_lesson_steps_${lessonId}`;

// Legacy global key from prior versions (before per-user key isolation)
const LEGACY_COMPLETED_LESSONS_KEY = 'nur_completed_lessons';

/** Returns user-scoped localStorage key for completed lessons */
export function userCompletedLessonsKey(userId?: string | null): string {
  return userId ? `nur_completed_lessons:${userId}` : 'nur_completed_lessons:guest';
}

/**
 * Migrates old shared 'nur_completed_lessons' key to 'nur_completed_lessons:<userId>'
 * on user login, then deletes the old key.
 */
function migrateLegacyKey(userId: string) {
  try {
    const raw = localStorage.getItem(LEGACY_COMPLETED_LESSONS_KEY);
    if (!raw) return;
    const legacyIds = JSON.parse(raw);
    if (Array.isArray(legacyIds) && legacyIds.length > 0) {
      const currentKey = userCompletedLessonsKey(userId);
      const existingRaw = localStorage.getItem(currentKey);
      const existingIds = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = Array.from(new Set([...(Array.isArray(existingIds) ? existingIds : []), ...legacyIds]));
      localStorage.setItem(currentKey, JSON.stringify(merged));
    }
    localStorage.removeItem(LEGACY_COMPLETED_LESSONS_KEY);
  } catch (err) {
    console.warn('[progress] legacy migration error:', err);
    localStorage.removeItem(LEGACY_COMPLETED_LESSONS_KEY);
  }
}

export function getCompletedLessonIds(userId?: string | null): string[] {
  try {
    if (userId) {
      migrateLegacyKey(userId);
    }
    const key = userCompletedLessonsKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as string[];

    // Guest fallback if legacy key still present
    if (!userId) {
      const legacyRaw = localStorage.getItem(LEGACY_COMPLETED_LESSONS_KEY);
      if (legacyRaw) return JSON.parse(legacyRaw) as string[];
    }
    return [];
  } catch {
    return [];
  }
}

export function setCompletedLessonIds(lessons: string[], userId?: string | null): void {
  try {
    const key = userCompletedLessonsKey(userId);
    localStorage.setItem(key, JSON.stringify(lessons));
  } catch (err) {
    console.warn('[progress] failed to save to localStorage:', err);
  }
}

/**
 * Reads completed lessons for this user from the `progress` table in Supabase,
 * merges them with `localStorage` (union of sets, never overwriting/dropping local items),
 * and writes the merged set back to `localStorage`.
 * Also backfills any locally completed lessons to the `progress` table in Supabase.
 */
export async function syncUserProgress(userId: string): Promise<string[]> {
  if (!userId) return getCompletedLessonIds(null);

  // Migrate legacy key first if it exists
  migrateLegacyKey(userId);

  try {
    const { data, error } = await supabase
      .from('progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('completed', true);

    if (error) {
      console.warn('[progress] sync from DB failed:', error.message);
      return getCompletedLessonIds(userId);
    }

    const remoteLessonIds = (data ?? []).map((r: any) => r.lesson_id).filter(Boolean);
    const localLessonIds = getCompletedLessonIds(userId);

    // Union of both sets (no overwrite of un-synced local progress)
    const mergedSet = new Set([...localLessonIds, ...remoteLessonIds]);
    const merged = Array.from(mergedSet);
    setCompletedLessonIds(merged, userId);

    // Best-effort backfill: push any local-only completed lessons to the DB
    const remoteSet = new Set(remoteLessonIds);
    const localOnly = localLessonIds.filter((id) => !remoteSet.has(id));
    if (localOnly.length > 0) {
      const rows = localOnly.map((lessonId) => ({
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      }));
      supabase
        .from('progress')
        .upsert(rows, { onConflict: 'user_id,lesson_id' })
        .then(({ error: upsertErr }) => {
          if (upsertErr) console.warn('[progress] local-to-remote backfill failed:', upsertErr.message);
        });
    }

    return merged;
  } catch (err) {
    console.warn('[progress] sync exception:', err);
    return getCompletedLessonIds(userId);
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const lessonStepsService = {
  /** Loads ordered steps for a lesson (uz locale), with quiz questions resolved. */
  async getLessonSteps(lessonId: string): Promise<LessonStep[]> {
    if (!UUID_RE.test(lessonId)) return [];

    const { data: steps, error } = await supabase
      .from('lesson_steps')
      .select('id, lesson_id, step_type, order_index')
      .eq('lesson_id', lessonId)
      .order('order_index', { ascending: true });

    if (error || !steps || steps.length === 0) return [];

    const stepIds = steps.map((s: any) => s.id);

    const [{ data: trans }, { data: links }] = await Promise.all([
      supabase.from('lesson_step_translations').select('step_id, title, content').eq('locale', 'uz').in('step_id', stepIds),
      supabase.from('lesson_step_questions').select('step_id, question_id, order_index').in('step_id', stepIds)
    ]);

    const questionIds = (links ?? []).map((l: any) => l.question_id);
    const [{ data: qTrans }, { data: qMeta }] = questionIds.length
      ? await Promise.all([
          supabase.from('question_bank_translations').select('question_id, question_text, options').eq('locale', 'uz').in('question_id', questionIds),
          supabase.from('question_bank').select('id, question_type').in('id', questionIds),
        ])
      : [{ data: [] as any[] }, { data: [] as any[] }];

    const typeById = new Map<string, QuizQuestionType>();
    for (const m of (qMeta ?? []) as any[]) {
      typeById.set(m.id, m.question_type === 'input' ? 'input' : 'multiple_choice');
    }

    const transByStep = new Map<string, { title: string | null; content: string | null }>();
    for (const t of (trans ?? []) as any[]) transByStep.set(t.step_id, { title: t.title, content: t.content });

    const qById = new Map<string, { text: string; options: string[]; correctIndex: number }>();
    for (const q of (qTrans ?? []) as any[]) {
      const { options, correctIndex } = parseOptions(q.options);
      qById.set(q.question_id, { text: q.question_text, options, correctIndex });
    }

    const questionsByStep = new Map<string, StepQuestion[]>();
    for (const link of (links ?? []) as any[]) {
      const q = qById.get(link.question_id);
      if (!q) continue;
      const list = questionsByStep.get(link.step_id) ?? [];
      list.push({
        id: link.question_id,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        questionType: typeById.get(link.question_id) ?? 'multiple_choice',
      });
      questionsByStep.set(link.step_id, list);
    }

    return (steps as any[]).map((s) => {
      const t = transByStep.get(s.id);
      return {
        id: s.id,
        lesson_id: s.lesson_id,
        step_type: s.step_type as StepType,
        order_index: s.order_index,
        title: t?.title ?? null,
        content: t?.content ?? null,
        questions: questionsByStep.get(s.id) ?? []
      };
    });
  },

  getCompletedStepIds(lessonId: string): string[] {
    try {
      const raw = localStorage.getItem(stepKey(lessonId));
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  },

  /**
   * Marks a step complete locally; when every step is done it records the lesson
   * as completed (locally + best-effort server upsert) and reports whether this
   * call was the one that completed the lesson, so the caller can award XP once.
   */
  async markStepComplete(params: {
    userId: string | null;
    lessonId: string;
    stepId: string;
    allStepIds: string[];
  }): Promise<{ lessonCompleted: boolean }> {
    const { userId, lessonId, stepId, allStepIds } = params;
    const done = new Set(this.getCompletedStepIds(lessonId));
    done.add(stepId);
    localStorage.setItem(stepKey(lessonId), JSON.stringify([...done]));

    const allDone = allStepIds.length > 0 && allStepIds.every((id) => done.has(id));
    let lessonCompleted = false;

    if (allDone) {
      // Local lesson-completion marker (drives sidebar/dashboard status, even for guests).
      const lessons = new Set(getCompletedLessonIds(userId));
      if (!lessons.has(lessonId)) {
        lessons.add(lessonId);
        setCompletedLessonIds([...lessons], userId);
        lessonCompleted = true;
      }

      // Best-effort server write; a failure here must never block lesson navigation.
      if (userId) {
        const { error } = await supabase
          .from('progress')
          .upsert(
            { user_id: userId, lesson_id: lessonId, step_id: stepId, completed: true, completed_at: new Date().toISOString() },
            { onConflict: 'user_id,lesson_id' }
          );
        if (error) console.error('[lesson] progress upsert failed:', error.message);
      }
    }

    console.log('[lesson] step complete:', { lessonId, stepId, allDone, lessonCompleted });
    return { lessonCompleted };
  }
};

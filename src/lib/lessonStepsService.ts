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
  imageUrl?: string | null;
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
  let correctIndex = -1;
  arr.forEach((item, i) => {
    if (item && typeof item === 'object') {
      const opt = item as RawOption;
      options.push(String(opt.text ?? ''));
      if (opt.is_correct === true) correctIndex = i;
    } else {
      options.push(String(item));
    }
  });
  return { options, correctIndex };
}

// Per-lesson completed step ids live in localStorage (prefixed nur_ → swept on logout).
// progress PK is (user_id, lesson_id), so it can't hold one row per step; we mirror
// completion locally and upsert the lesson-level progress row when all steps are done.
const stepKey = (lessonId: string) => `nur_lesson_steps_${lessonId}`;

// Lesson-level completion set, mirrored locally so the course view (sidebar /
// dashboard) can reflect progress even without an authenticated session.
const COMPLETED_LESSONS_KEY = 'nur_completed_lessons';

export function getCompletedLessonIds(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_LESSONS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
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
          supabase.from('question_bank').select('id, question_type, image_url').in('id', questionIds),
        ])
      : [{ data: [] as any[] }, { data: [] as any[] }];

    const typeById = new Map<string, QuizQuestionType>();
    const imageById = new Map<string, string | null>();
    for (const m of (qMeta ?? []) as any[]) {
      typeById.set(m.id, m.question_type === 'input' ? 'input' : 'multiple_choice');
      imageById.set(m.id, m.image_url ?? null);
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
        imageUrl: imageById.get(link.question_id) ?? null,
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
      const lessons = new Set(getCompletedLessonIds());
      if (!lessons.has(lessonId)) {
        lessons.add(lessonId);
        localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify([...lessons]));
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

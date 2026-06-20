import { supabase } from './supabase';

export interface LessonNotes {
  fact_1: string;
  fact_2: string;
  fact_3: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Guest notes live in localStorage under the nur_ prefix (swept on logout).
const guestKey = (lessonId: string) => `nur_lesson_notes_${lessonId}`;

const empty = (): LessonNotes => ({ fact_1: '', fact_2: '', fact_3: '' });

function readGuest(lessonId: string): LessonNotes {
  try {
    const raw = localStorage.getItem(guestKey(lessonId));
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<LessonNotes>;
    return { fact_1: parsed.fact_1 ?? '', fact_2: parsed.fact_2 ?? '', fact_3: parsed.fact_3 ?? '' };
  } catch {
    return empty();
  }
}

export const lessonNotesService = {
  /** Loads saved notes for the current user+lesson (DB for auth, localStorage for guests). */
  async get(userId: string | null, lessonId: string): Promise<LessonNotes> {
    if (userId && UUID_RE.test(lessonId)) {
      try {
        const { data, error } = await supabase
          .from('lesson_notes')
          .select('fact_1, fact_2, fact_3')
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)
          .maybeSingle();
        if (error) throw error;
        if (data) return { fact_1: data.fact_1 ?? '', fact_2: data.fact_2 ?? '', fact_3: data.fact_3 ?? '' };
        return empty();
      } catch (err) {
        console.error('lessonNotesService.get failed, falling back to local:', err);
        return readGuest(lessonId);
      }
    }
    return readGuest(lessonId);
  },

  /** Upserts notes (one row per user+lesson). Guests persist to localStorage. */
  async save(userId: string | null, lessonId: string, notes: LessonNotes): Promise<{ ok: boolean }> {
    if (userId && UUID_RE.test(lessonId)) {
      try {
        const { error } = await supabase.from('lesson_notes').upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            fact_1: notes.fact_1,
            fact_2: notes.fact_2,
            fact_3: notes.fact_3,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        );
        if (error) throw error;
        return { ok: true };
      } catch (err) {
        console.error('lessonNotesService.save failed:', err);
        return { ok: false };
      }
    }
    try {
      localStorage.setItem(guestKey(lessonId), JSON.stringify(notes));
      return { ok: true };
    } catch (err) {
      console.error('lessonNotesService.save (guest) failed:', err);
      return { ok: false };
    }
  },
};

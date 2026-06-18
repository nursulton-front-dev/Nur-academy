import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { ATTESTATSIYA_COURSE_ID } from './courses';
import type { Module, Lesson } from '../data/attestatsiyaMocks';

/**
 * Reads the Attestatsiya course structure (modules + lessons + uz titles) from
 * Supabase and shapes it into the existing `Module[]` form the UI already
 * understands, so the sidebar / dashboard render without per-component rewrites.
 *
 * Tables: modules, module_translations, lessons, lesson_translations.
 * course_id is fixed (see lib/courses.ts).
 *
 * Two deliberate bridges during the migration:
 *  1. Lesson routing id — the DB stores `lessons.content` as a pointer like
 *     "[mock:l1_1]". We route on that mock id so the existing lesson page keeps
 *     resolving content; if there is no pointer we fall back to the DB UUID.
 *  2. Status — not stored in the DB yet. Until progress integration lands we
 *     apply a safe temporary rule: module 1 is `current` with its first lesson
 *     `current`, everything else `locked`. This never hard-locks the whole UI.
 */

interface TranslationRow {
  locale: string;
  title: string;
}

interface DbLesson {
  id: string;
  order_index: number | null;
  content: string | null;
  video_url: string | null;
  lesson_translations: TranslationRow[] | null;
}

interface DbModule {
  id: string;
  order_index: number | null;
  module_translations: TranslationRow[] | null;
  lessons: DbLesson[] | null;
}

function uzTitle(rows: TranslationRow[] | null | undefined, fallback: string): string {
  if (!rows || rows.length === 0) return fallback;
  return rows.find((r) => r.locale === 'uz')?.title || rows[0]?.title || fallback;
}

// "[mock:l1_1]" -> "l1_1"; otherwise the DB UUID so routing still resolves.
function routeId(content: string | null, dbId: string): string {
  if (content) {
    const match = content.match(/^\[mock:([^\]]+)\]$/);
    if (match) return match[1];
  }
  return dbId;
}

export async function fetchAttestatsiyaCourse(): Promise<Module[]> {
  const { data, error } = await supabase
    .from('modules')
    .select(
      'id, order_index, module_translations(locale, title), lessons(id, order_index, content, video_url, lesson_translations(locale, title))'
    )
    .eq('course_id', ATTESTATSIYA_COURSE_ID)
    .order('order_index', { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as unknown as DbModule[];

  return rows.map((mod, moduleIdx): Module => {
    const order = mod.order_index ?? moduleIdx + 1;
    const isFirstModule = moduleIdx === 0;

    const lessonsSorted = [...(mod.lessons ?? [])].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
    );

    const lessons: Lesson[] = lessonsSorted.map((les, lessonIdx): Lesson => {
      // Temporary status rule (see file header) until progress integration.
      let status: Lesson['status'] = 'locked';
      if (isFirstModule) status = lessonIdx === 0 ? 'current' : 'locked';

      return {
        id: routeId(les.content, les.id),
        moduleId: `m${order}`,
        title: uzTitle(les.lesson_translations, 'Dars'),
        content: les.content ?? '',
        status,
        videoUrl: les.video_url ?? undefined,
      };
    });

    return {
      // Mock-style id (`m1`..`m8`) keeps topic-test lookups and module icons
      // working while the structure itself now comes from Supabase.
      id: `m${order}`,
      title: `${order}. ${uzTitle(mod.module_translations, 'Modul')}`,
      description: '',
      status: isFirstModule ? 'current' : 'locked',
      lessons,
    };
  });
}

interface UseAttestatsiyaCourse {
  modules: Module[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useAttestatsiyaCourse(): UseAttestatsiyaCourse {
  const [modules, setModules] = useState<Module[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setModules(null);
    try {
      const data = await fetchAttestatsiyaCourse();
      // Temporary migration check: confirm the structure is coming from the DB.
      console.log('[attestatsiya] modules loaded from Supabase:', data.length);
      setModules(data);
    } catch (err) {
      console.error('[attestatsiya] course load failed:', err);
      setError('Kurs maʼlumotlarini yuklab boʻlmadi');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { modules, loading: modules === null && !error, error, reload: load };
}

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  NotebookPen,
  Pencil,
  ArrowRight,
  Check,
  X,
  Loader2,
  BookOpen,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchAttestatsiyaCourse } from '../lib/attestatsiyaCourse';
import { coursePath } from '../lib/courses';
import { lessonNotesService, LessonNotes, StoredLessonNotes } from '../lib/lessonNotesService';
import type { Module } from '../data/attestatsiyaMocks';
import { AppPage, PageHeader, PageContent } from '../components/app/AppPage';

const FACT_KEYS: Array<keyof LessonNotes> = ['fact_1', 'fact_2', 'fact_3'];

function hasAnyFact(note: StoredLessonNotes | undefined): boolean {
  if (!note) return false;
  return FACT_KEYS.some((k) => (note[k] ?? '').trim().length > 0);
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface LessonWithNote {
  lessonId: string;
  title: string;
  note: StoredLessonNotes;
}

interface ModuleGroup {
  moduleId: string;
  title: string;
  lessons: LessonWithNote[];
}

export default function Konspektlar() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { slug = 'attestatsiya' } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [notes, setNotes] = useState<Record<string, StoredLessonNotes>>({});

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LessonNotes>({ fact_1: '', fact_2: '', fact_3: '' });
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([fetchAttestatsiyaCourse(), lessonNotesService.getAllNotes(user?.id ?? null)])
      .then(([courseModules, notesMap]) => {
        if (cancelled) return;
        setModules(courseModules);
        setNotes(notesMap);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Konspektlar load failed:', err);
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  // Group notes under their module → lesson, in course order. Lessons without
  // a saved note are dropped; empty modules disappear.
  const groups = useMemo<ModuleGroup[]>(() => {
    return modules
      .map((mod) => ({
        moduleId: mod.id,
        title: mod.title,
        lessons: mod.lessons
          .filter((les) => hasAnyFact(notes[les.id]))
          .map((les) => ({ lessonId: les.id, title: les.title, note: notes[les.id]! })),
      }))
      .filter((g) => g.lessons.length > 0);
  }, [modules, notes]);

  const totalNotes = useMemo(
    () => groups.reduce((acc, g) => acc + g.lessons.length, 0),
    [groups]
  );

  const startEdit = (lessonId: string, note: StoredLessonNotes) => {
    setEditingId(lessonId);
    setDraft({ fact_1: note.fact_1, fact_2: note.fact_2, fact_3: note.fact_3 });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ fact_1: '', fact_2: '', fact_3: '' });
  };

  const saveEdit = async (lessonId: string) => {
    setSavingId(lessonId);
    const { ok } = await lessonNotesService.save(user?.id ?? null, lessonId, draft);
    setSavingId(null);
    if (!ok) return;
    setNotes((prev) => ({
      ...prev,
      [lessonId]: { ...draft, updated_at: new Date().toISOString() },
    }));
    setEditingId(null);
  };

  /* ───────────── Loading ───────────── */
  if (authLoading || loading) {
    return (
      <AppPage>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
        </div>
      </AppPage>
    );
  }

  return (
    <AppPage className="text-left font-sans">
      <PageHeader
        title="Mening konspektlarim"
        description="Darslarda yozgan eng muhim 3 ta faktingiz — imtihon oldidan tez takrorlash uchun bir joyda."
        action={
          totalNotes > 0 ? (
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
            >
              <NotebookPen className="w-4 h-4" />
              {totalNotes} ta konspekt
            </span>
          ) : undefined
        }
      />

      <PageContent>
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5 text-sm font-medium text-rose-600 dark:text-rose-400">
            Konspektlarni yuklab boʻlmadi. Sahifani yangilab koʻring.
          </div>
        )}

        {/* Empty state */}
        {!error && totalNotes === 0 && (
          <div className="rounded-2xl border border-border-card bg-surface p-10 sm:p-14 text-center shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
              <NotebookPen className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary">
              Hali konspekt yoʻq
            </h2>
            <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
              Darslarni oʻrganib, eng muhim 3 ta faktni yozing! Ular shu yerda toʻplanib boradi va
              imtihon oldidan takrorlashga yordam beradi.
            </p>

            {!user && (
              <p className="mt-3 text-xs text-text-secondary inline-flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                Konspektlaringizni saqlash uchun tizimga kiring.
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={coursePath(slug)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-accent-blue hover:bg-accent-hover shadow-sm transition-all active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                Darslarga oʻtish
              </Link>
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold border border-border-card text-text-primary hover:bg-surface-hover transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Kirish
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grouped notes */}
        {!error &&
          groups.map((group) => (
            <section key={group.moduleId} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-1.5 h-5 rounded-full bg-accent-blue"
                  aria-hidden
                />
                <h2 className="text-base sm:text-lg font-serif font-extrabold text-text-primary">
                  {group.title}
                </h2>
                <span className="text-[11px] font-bold text-text-secondary bg-primary-bg border border-border-card px-2 py-0.5 rounded-md">
                  {group.lessons.length}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {group.lessons.map(({ lessonId, title, note }) => {
                  const isEditing = editingId === lessonId;
                  const isSaving = savingId === lessonId;
                  const updated = formatDate(note.updated_at);
                  const visibleFacts = FACT_KEYS.map((k) => note[k]).filter(
                    (f) => (f ?? '').trim().length > 0
                  );

                  return (
                    <article
                      key={lessonId}
                      className="rounded-2xl border border-border-card bg-surface p-5 sm:p-6 shadow-xs hover:border-accent-blue/30 transition-all flex flex-col"
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <NotebookPen className="w-4.5 h-4.5" />
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-serif font-bold text-text-primary leading-snug">
                              {title}
                            </h3>
                            {updated && (
                              <p className="text-[11px] text-text-secondary mt-0.5">
                                Yangilangan: {updated}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Facts (read) or editor */}
                      {isEditing ? (
                        <div className="space-y-3">
                          {FACT_KEYS.map((key, i) => (
                            <div key={key} className="flex gap-3 items-start">
                              <span className="mt-2 w-6 h-6 shrink-0 rounded-lg bg-accent-blue/10 text-accent-blue text-xs font-bold flex items-center justify-center">
                                {i + 1}
                              </span>
                              <textarea
                                value={draft[key]}
                                onChange={(e) =>
                                  setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                rows={2}
                                placeholder={`${i + 1}-faktni yozing…`}
                                className="flex-1 p-3 rounded-xl border border-border-card bg-surface text-sm text-text-primary outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all resize-y"
                              />
                            </div>
                          ))}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => saveEdit(lessonId)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-accent-blue hover:bg-accent-hover shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                              {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 stroke-[2.5]" />
                              )}
                              Saqlash
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-border-card text-text-secondary hover:bg-surface-hover transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Bekor qilish
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ul className="space-y-2.5 flex-grow">
                          {visibleFacts.map((fact, i) => (
                            <li key={i} className="flex gap-3 items-start">
                              <span className="mt-0.5 w-6 h-6 shrink-0 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                                {i + 1}
                              </span>
                              <p className="text-sm text-text-primary leading-relaxed">{fact}</p>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Card actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border-card">
                          <button
                            onClick={() => startEdit(lessonId, note)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Tahrirlash
                          </button>
                          <Link
                            to={coursePath(slug, `dars/${lessonId}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-border-card text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors ml-auto"
                          >
                            Darsga oʻtish
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}

        {/* Footer hint when notes exist */}
        {!error && totalNotes > 0 && (
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-text-secondary pt-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Har darsdan keyin 3 ta faktni yozib boring — takrorlash osonlashadi.
          </p>
        )}
      </PageContent>
    </AppPage>
  );
}

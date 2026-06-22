import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { lessonNotesService, LessonNotes, StoredLessonNotes } from '../lib/lessonNotesService';
import type { Module } from '../data/attestatsiyaMocks';
import { AppPage, PageHeader, PageContent } from '../components/app/AppPage';

const AMBER = '#F59E0B';
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
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: AMBER }} />
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ backgroundColor: `${AMBER}1A`, color: AMBER }}
            >
              <NotebookPen className="w-4 h-4" />
              {totalNotes} ta konspekt
            </span>
          ) : undefined
        }
      />

      <PageContent>
        {error && (
          <div className="rounded-2xl border border-[#E0735C]/30 bg-[#E0735C]/5 p-5 text-sm font-medium text-[#E0735C]">
            Konspektlarni yuklab boʻlmadi. Sahifani yangilab koʻring.
          </div>
        )}

        {/* Empty state */}
        {!error && totalNotes === 0 && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-dashed p-10 sm:p-14 text-center"
            style={{ borderColor: `${AMBER}40`, backgroundColor: `${AMBER}08` }}>
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: `${AMBER}1A` }}
            />
            <div
              className="relative z-10 w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white shadow-md mb-5"
              style={{ backgroundColor: AMBER, boxShadow: `0 8px 24px ${AMBER}33` }}
            >
              <NotebookPen className="w-8 h-8" />
            </div>
            <h2 className="relative z-10 text-xl sm:text-2xl font-serif font-extrabold text-text-primary">
              Hali konspekt yoʻq
            </h2>
            <p className="relative z-10 mt-2 text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
              Darslarni oʻrganib, eng muhim 3 ta faktni yozing! Ular shu yerda toʻplanib boradi va
              imtihon oldidan takrorlashga yordam beradi.
            </p>

            {!user && (
              <p className="relative z-10 mt-3 text-xs text-text-secondary inline-flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                Konspektlaringizni saqlash uchun tizimga kiring.
              </p>
            )}

            <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/attestatsiya"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-md transition-all active:scale-[0.98]"
                style={{ backgroundColor: AMBER }}
              >
                <BookOpen className="w-4.5 h-4.5" />
                Darslarga oʻtish
              </Link>
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold border border-border-card text-text-primary hover:bg-surface-hover transition-all"
                >
                  <LogIn className="w-4.5 h-4.5" />
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
                  className="w-1.5 h-6 rounded-full"
                  style={{ backgroundColor: AMBER }}
                  aria-hidden
                />
                <h2 className="text-base sm:text-lg font-serif font-extrabold text-text-primary">
                  {group.title}
                </h2>
                <span className="text-[11px] font-bold text-text-secondary bg-surface-muted px-2 py-0.5 rounded-md">
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
                      className="rounded-3xl border-2 p-5 sm:p-6 relative overflow-hidden flex flex-col"
                      style={{ borderColor: `${AMBER}33`, backgroundColor: `${AMBER}0A` }}
                    >
                      <div
                        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                        style={{ backgroundColor: `${AMBER}14` }}
                      />

                      {/* Card header */}
                      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                            style={{ backgroundColor: AMBER }}
                          >
                            <NotebookPen className="w-5 h-5" />
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
                        <div className="relative z-10 space-y-3">
                          {FACT_KEYS.map((key, i) => (
                            <div key={key} className="flex gap-3 items-start">
                              <span
                                className="mt-2 w-7 h-7 shrink-0 rounded-lg text-white text-xs font-bold flex items-center justify-center"
                                style={{ backgroundColor: AMBER }}
                              >
                                {i + 1}
                              </span>
                              <textarea
                                value={draft[key]}
                                onChange={(e) =>
                                  setDraft((prev) => ({ ...prev, [key]: e.target.value }))
                                }
                                rows={2}
                                placeholder={`${i + 1}-faktni yozing…`}
                                className="flex-1 p-3 rounded-xl border bg-surface text-sm text-text-primary outline-none focus:ring-2 transition-all resize-y"
                                style={{ borderColor: `${AMBER}40` }}
                              />
                            </div>
                          ))}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => saveEdit(lessonId)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                              style={{ backgroundColor: AMBER }}
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
                              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold border border-border-card text-text-secondary hover:bg-surface-hover transition-all"
                            >
                              <X className="w-4 h-4" />
                              Bekor qilish
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ul className="relative z-10 space-y-2.5 flex-grow">
                          {visibleFacts.map((fact, i) => (
                            <li key={i} className="flex gap-3 items-start">
                              <span
                                className="mt-0.5 w-6 h-6 shrink-0 rounded-lg text-white text-xs font-bold flex items-center justify-center"
                                style={{ backgroundColor: AMBER }}
                              >
                                {i + 1}
                              </span>
                              <p className="text-sm text-text-primary leading-relaxed">{fact}</p>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Card actions */}
                      {!isEditing && (
                        <div className="relative z-10 flex items-center gap-2 pt-4 mt-4 border-t border-border-card/50">
                          <button
                            onClick={() => startEdit(lessonId, note)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
                            style={{ backgroundColor: `${AMBER}1A`, color: AMBER }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Tahrirlash
                          </button>
                          <Link
                            to={`/attestatsiya/dars/${lessonId}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border border-border-card text-text-primary hover:bg-surface-hover transition-all ml-auto"
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
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-text-secondary pt-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: AMBER }} />
            Har darsdan keyin 3 ta faktni yozib boring — takrorlash osonlashadi.
          </p>
        )}
      </PageContent>
    </AppPage>
  );
}

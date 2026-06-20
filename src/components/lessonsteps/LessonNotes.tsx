import React, { useEffect, useState } from 'react';
import { NotebookPen, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { lessonNotesService, LessonNotes as Notes } from '../../lib/lessonNotesService';

interface LessonNotesProps {
  lessonId: string;
}

const FACT_KEYS: Array<keyof Notes> = ['fact_1', 'fact_2', 'fact_3'];

export default function LessonNotes({ lessonId }: LessonNotesProps) {
  const { user } = useAuth();
  const [facts, setFacts] = useState<Notes>({ fact_1: '', fact_2: '', fact_3: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    lessonNotesService.get(user?.id ?? null, lessonId).then((n) => {
      if (cancelled) return;
      setFacts(n);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, lessonId]);

  const updateFact = (key: keyof Notes) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFacts((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
    setError(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(false);
    const { ok } = await lessonNotesService.save(user?.id ?? null, lessonId, facts);
    setSaving(false);
    if (ok) setJustSaved(true);
    else setError(true);
  };

  const hasContent = FACT_KEYS.some((k) => facts[k].trim().length > 0);

  return (
    <div className="rounded-3xl border p-6 sm:p-8 bg-amber-50/70 dark:bg-amber-400/[0.06] border-amber-200 dark:border-amber-400/25">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-amber-100 dark:bg-amber-400/15 text-amber-600">
          <NotebookPen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary">
            📝 Konspekt: 3 ta fakt
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Shu darsdan eslab qolgan 3 ta muhim faktni yozing — keyin takrorlash uchun saqlanadi.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-text-secondary py-8">
          <Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda…
        </div>
      ) : (
        <div className="space-y-3 mt-5">
          {FACT_KEYS.map((key, i) => (
            <div key={key} className="flex gap-3 items-start">
              <span className="mt-2.5 w-7 h-7 shrink-0 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <textarea
                value={facts[key]}
                onChange={updateFact(key)}
                rows={2}
                placeholder={`${i + 1}-fakt…`}
                className="flex-1 p-3 rounded-xl border border-amber-200 dark:border-amber-400/25 bg-surface text-sm text-text-primary outline-none focus:border-amber-500 transition-all resize-y"
              />
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !hasContent}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-97 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Saqlash
            </button>
            {justSaved && !saving && (
              <span className="text-xs font-semibold text-emerald-600">Saqlandi ✓</span>
            )}
            {error && !saving && (
              <span className="text-xs font-semibold text-rose-600">Saqlab boʻlmadi, qayta urinib koʻring.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

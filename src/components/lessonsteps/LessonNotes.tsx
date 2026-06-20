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
    <div className="rounded-3xl border-2 p-6 sm:p-8 bg-[#F59E0B]/[0.03] dark:bg-[#F59E0B]/[0.08] border-[#F59E0B]/20 shadow-sm relative overflow-hidden">
      {/* Decorative amber blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#F59E0B] text-white shadow-md shadow-[#F59E0B]/20">
          <NotebookPen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary">
            Dars konspekti: 3 ta muhim fakt
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Darsdan eslab qolgan 3 ta eng muhim g'oya yoki faktni yozing — keyin takrorlash uchun saqlanadi.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 text-sm text-text-secondary py-12">
          <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B]" /> Yuklanmoqda…
        </div>
      ) : (
        <div className="space-y-4 mt-6 relative z-10">
          {FACT_KEYS.map((key, i) => (
            <div key={key} className="flex gap-4 items-start">
              <span className="mt-2 w-8 h-8 shrink-0 rounded-xl bg-[#F59E0B] text-white text-sm font-bold flex items-center justify-center shadow-sm shadow-[#F59E0B]/25">
                {i + 1}
              </span>
              <textarea
                value={facts[key]}
                onChange={updateFact(key)}
                rows={2}
                placeholder={`${i + 1}-faktni shu yerga yozing…`}
                className="flex-1 p-3.5 rounded-2xl border border-[#F59E0B]/20 dark:border-[#F59E0B]/30 bg-surface text-sm text-text-primary outline-none focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-all resize-y shadow-inner"
              />
            </div>
          ))}

          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={handleSave}
              disabled={saving || !hasContent}
              className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-40 disabled:cursor-not-allowed text-white px-7 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#F59E0B]/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              {saving ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Check className="w-4.5 h-4.5 stroke-[2.5]" />}
              Konspektni saqlash
            </button>
            {justSaved && !saving && (
              <span className="text-xs font-semibold text-[#4CAF82] flex items-center gap-1">
                ✓ Muvaffaqiyatli saqlandi
              </span>
            )}
            {error && !saving && (
              <span className="text-xs font-semibold text-[#E0735C]">
                Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

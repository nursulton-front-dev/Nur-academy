import React from 'react';
import { ArrowRight, AlertTriangle, BookOpen, PlayCircle, Target, Sparkles, type LucideIcon } from 'lucide-react';
import { LessonStep } from '../../lib/lessonStepsService';
import { renderMarkdown } from '../../lib/markdown';

interface StepProps {
  step: LessonStep;
  onComplete: (completed: boolean) => void;
  isLastLesson?: boolean;
  videoUrl?: string | null;
  isFirstStep?: boolean;
}

// Small colored eyebrow that makes each step type recognizable at a glance.
function StepEyebrow({ icon: Icon, label, color }: { icon: LucideIcon; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-xl shrink-0 shadow-sm shadow-black/[0.02]"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function ContinueButton({ label, onClick, tone = 'blue' }: { label: string; onClick: () => void; tone?: 'blue' | 'green' | 'red' }) {
  const cls =
    tone === 'green'
      ? 'bg-[#4CAF82] hover:bg-[#429a72] shadow-[#4CAF82]/15'
      : tone === 'red'
      ? 'bg-[#E0735C] hover:bg-[#cf6450] shadow-[#E0735C]/15'
      : 'bg-[#3B7DD8] hover:bg-[#3570c4] shadow-[#3B7DD8]/15';
  return (
    <button
      onClick={onClick}
      className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 ${cls} text-white px-7 py-4 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer`}
    >
      {label} <ArrowRight className="w-4 h-4 stroke-[2.5]" />
    </button>
  );
}

// Plain reading step — the markdown renderer carries the premium styling.
export function TextStep({ step, onComplete, isFirstStep }: StepProps) {
  if (isFirstStep) {
    return (
      <div className="max-w-[900px] mx-auto w-full space-y-6">
        <StepEyebrow icon={Sparkles} label="Kirish" color="#3B7DD8" />
        {step.title && (
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary mb-4 leading-tight">
            {step.title}
          </h2>
        )}
        
        {/* Goals / Motivational block */}
        <div className="bg-gradient-to-br from-[#3B7DD8]/[0.04] to-[#3B7DD8]/[0.01] dark:from-[#3B7DD8]/[0.08] dark:to-transparent border border-[#3B7DD8]/20 rounded-3xl p-6 sm:p-8 shadow-sm flex gap-4 items-start">
          <div className="p-3 bg-[#3B7DD8] text-white rounded-2xl shrink-0 shadow-md shadow-[#3B7DD8]/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1.5">Dars maqsadi va kutilayotgan natijalar</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Ushbu dars davomida mavzuning nazariy asoslari, eng muhim qoidalari va real misollarni o'rganasiz. Kiber-kviz orqali bilimingizni tekshirib, AI Mentor yordamida xatolaringizni tahlil qiling.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#3B7DD8]">
              <span className="px-3 py-1.5 rounded-full bg-[#3B7DD8]/10 dark:bg-[#3B7DD8]/15">✓ Nazariy tushunchalar</span>
              <span className="px-3 py-1.5 rounded-full bg-[#3B7DD8]/10 dark:bg-[#3B7DD8]/15">✓ Kiber-kviz</span>
              <span className="px-3 py-1.5 rounded-full bg-[#3B7DD8]/10 dark:bg-[#3B7DD8]/15">✓ AI Mentor tavsiyalari</span>
            </div>
          </div>
        </div>

        <div className="text-text-primary leading-relaxed text-[15px] sm:text-base">{renderMarkdown(step.content || '')}</div>
        <div className="pt-6">
          <ContinueButton label="Darsni boshlash" onClick={() => onComplete(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto w-full space-y-6">
      <StepEyebrow icon={BookOpen} label="Nazariya" color="#3B7DD8" />
      {step.title && (
        <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary mb-4 leading-tight border-l-4 border-[#3B7DD8] pl-4">
          {step.title}
        </h2>
      )}
      <div className="text-text-primary leading-relaxed text-[15px] sm:text-base">{renderMarkdown(step.content || '')}</div>
      <div className="pt-6">
        <ContinueButton label="Tushundim, keyingi qadam" onClick={() => onComplete(true)} />
      </div>
    </div>
  );
}

export function CommonMistakesStep({ step, onComplete }: StepProps) {
  return (
    <div className="max-w-[900px] mx-auto w-full space-y-6">
      <StepEyebrow icon={AlertTriangle} label="Xatolar tahlili" color="#E0735C" />
      <div className="rounded-3xl border-2 p-6 sm:p-8 bg-[#E0735C]/[0.03] dark:bg-[#E0735C]/[0.08] border-[#E0735C]/20 shadow-sm relative overflow-hidden">
        {/* Subtle background light */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E0735C]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#E0735C] text-white shadow-md shadow-[#E0735C]/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary">
              {step.title || 'Koʻp uchraydigan xatolar'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">Ushbu mavzuda eng ko'p yo'l qo'yiladigan xatolar va ularni to'g'rilash usullari</p>
          </div>
        </div>
        <div className="text-text-primary leading-relaxed text-sm sm:text-base relative z-10">{renderMarkdown(step.content || '')}</div>
      </div>
      <div className="pt-2">
        <ContinueButton label="Eslab qoldim, keyingi qadam" onClick={() => onComplete(true)} tone="red" />
      </div>
    </div>
  );
}

export function SummaryStep({ step, onComplete, isLastLesson }: StepProps) {
  return (
    <div className="max-w-[900px] mx-auto w-full space-y-6">
      <StepEyebrow icon={Target} label="Dars yakuni" color="#4CAF82" />
      <div className="rounded-3xl border-2 p-6 sm:p-8 bg-[#4CAF82]/[0.03] dark:bg-[#4CAF82]/[0.08] border-[#4CAF82]/20 shadow-sm relative overflow-hidden">
        {/* Subtle background light */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4CAF82]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#4CAF82] text-white shadow-md shadow-[#4CAF82]/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary">
              {step.title || 'Xulosa va natijalar'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">Darsning qisqacha mazmuni va asosiy xulosalari</p>
          </div>
        </div>
        <div className="text-text-primary leading-relaxed text-sm sm:text-base relative z-10">{renderMarkdown(step.content || '')}</div>
      </div>
      <div className="pt-2">
        <ContinueButton
          label={isLastLesson ? 'Modulni yakunlash' : 'Keyingi darsga oʻtish'}
          onClick={() => onComplete(true)}
          tone="green"
        />
      </div>
    </div>
  );
}

// Extracts a YouTube embed URL from a watch/share/embed link.
function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function VideoStep({ step, onComplete, videoUrl }: StepProps) {
  const url = videoUrl || '';
  const embed = url ? youtubeEmbed(url) : null;
  return (
    <div className="max-w-[900px] mx-auto w-full space-y-6">
      <StepEyebrow icon={PlayCircle} label="Videodars" color="#3B7DD8" />
      {step.title && (
        <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary border-l-4 border-[#3B7DD8] pl-4 mb-4">
          {step.title}
        </h2>
      )}
      <div className="aspect-video rounded-3xl overflow-hidden border border-border-card bg-black shadow-lg relative group">
        {embed ? (
          <iframe
            className="w-full h-full border-none"
            src={embed}
            title={step.title || 'video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary gap-3 bg-surface-muted/30">
            <PlayCircle className="w-12 h-12 text-[#3B7DD8] animate-pulse" />
            <span className="text-sm font-semibold">Video havola yuklanmoqda yoki mavjud emas</span>
          </div>
        )}
      </div>
      {step.content && (
        <div className="text-text-primary text-[15px] sm:text-base leading-relaxed bg-surface/50 border border-border-card/60 p-5 rounded-2xl mt-4">
          {renderMarkdown(step.content)}
        </div>
      )}
      <div className="pt-4">
        <ContinueButton label="Koʻrdim, keyingi qadam" onClick={() => onComplete(true)} />
      </div>
    </div>
  );
}

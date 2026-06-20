import React from 'react';
import { ArrowRight, AlertTriangle, BookOpen, PlayCircle, Target, type LucideIcon } from 'lucide-react';
import { LessonStep } from '../../lib/lessonStepsService';
import { renderMarkdown } from '../../lib/markdown';

interface StepProps {
  step: LessonStep;
  onComplete: (completed: boolean) => void;
  isLastLesson?: boolean;
  videoUrl?: string | null;
}

// Small colored eyebrow that makes each step type recognizable at a glance.
function StepEyebrow({ icon: Icon, label, color }: { icon: LucideIcon; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function ContinueButton({ label, onClick, tone = 'blue' }: { label: string; onClick: () => void; tone?: 'blue' | 'green' | 'red' }) {
  const cls =
    tone === 'green'
      ? 'bg-[#4CAF82] hover:bg-[#429a72]'
      : tone === 'red'
      ? 'bg-[#E0735C] hover:bg-[#cf6450]'
      : 'bg-[#3B7DD8] hover:bg-[#3570c4]';
  return (
    <button
      onClick={onClick}
      className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 ${cls} text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.97] cursor-pointer`}
    >
      {label} <ArrowRight className="w-4 h-4" />
    </button>
  );
}

// Plain reading step — the markdown renderer carries the premium styling.
export function TextStep({ step, onComplete }: StepProps) {
  return (
    <div className="max-w-[900px] mx-auto w-full">
      <StepEyebrow icon={BookOpen} label="Nazariya" color="#3B7DD8" />
      {step.title && (
        <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-text-primary mb-6 leading-tight">
          {step.title}
        </h2>
      )}
      <div className="text-text-primary">{renderMarkdown(step.content || '')}</div>
      <div className="pt-8">
        <ContinueButton label="Tushundim" onClick={() => onComplete(true)} />
      </div>
    </div>
  );
}

export function CommonMistakesStep({ step, onComplete }: StepProps) {
  return (
    <div className="max-w-[900px] mx-auto w-full">
      <StepEyebrow icon={AlertTriangle} label="Tez-tez uchraydigan xatolar" color="#E0735C" />
      <div className="rounded-3xl border p-6 sm:p-8 bg-rose-50/60 dark:bg-[#E0735C]/[0.07] border-rose-200 dark:border-[#E0735C]/25">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-rose-100 dark:bg-[#E0735C]/15 text-[#E0735C]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary">
            {step.title || 'Koʻp uchraydigan xatolar'}
          </h2>
        </div>
        <div className="text-text-primary">{renderMarkdown(step.content || '')}</div>
      </div>
      <div className="pt-6">
        <ContinueButton label="Eslab qoldim" onClick={() => onComplete(true)} tone="red" />
      </div>
    </div>
  );
}

export function SummaryStep({ step, onComplete, isLastLesson }: StepProps) {
  return (
    <div className="max-w-[900px] mx-auto w-full">
      <StepEyebrow icon={Target} label="Xulosa" color="#4CAF82" />
      <div className="rounded-3xl border p-6 sm:p-8 bg-emerald-50/60 dark:bg-[#4CAF82]/[0.07] border-emerald-200 dark:border-[#4CAF82]/25">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-[#4CAF82]/15 text-[#4CAF82]">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary">{step.title || 'Xulosa'}</h2>
        </div>
        <div className="text-text-primary">{renderMarkdown(step.content || '')}</div>
      </div>
      <div className="pt-6">
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
      <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary">{step.title || 'Videodars'}</h2>
      <div className="aspect-video rounded-2xl overflow-hidden border border-border-card bg-black">
        {embed ? (
          <iframe
            className="w-full h-full"
            src={embed}
            title={step.title || 'video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/70 gap-2">
            <BookOpen className="w-8 h-8" />
            <span className="text-xs">Video havolasi mavjud emas</span>
          </div>
        )}
      </div>
      {step.content && <div className="text-text-primary">{renderMarkdown(step.content)}</div>}
      <div className="pt-2">
        <ContinueButton label="Koʻrdim" onClick={() => onComplete(true)} />
      </div>
    </div>
  );
}

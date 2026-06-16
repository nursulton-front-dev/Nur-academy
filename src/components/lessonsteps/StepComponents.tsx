import React from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, BookOpen, PlayCircle } from 'lucide-react';
import { LessonStep } from '../../lib/lessonStepsService';
import { renderMarkdown } from '../../lib/markdown';

interface StepProps {
  step: LessonStep;
  onComplete: (completed: boolean) => void;
  isLastLesson?: boolean;
  videoUrl?: string | null;
}

function ContinueButton({ label, onClick, tone = 'blue' }: { label: string; onClick: () => void; tone?: 'blue' | 'green' | 'red' }) {
  const cls =
    tone === 'green'
      ? 'bg-emerald-500 hover:bg-emerald-600'
      : tone === 'red'
      ? 'bg-rose-500 hover:bg-rose-600'
      : 'bg-accent-blue hover:bg-accent-blue/95';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 ${cls} text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-97 cursor-pointer`}
    >
      {label} <ArrowRight className="w-4 h-4" />
    </button>
  );
}

export function TextStep({ step, onComplete }: StepProps) {
  return (
    <div className="max-w-[760px] mx-auto w-full space-y-6">
      {step.title && <h2 className="text-2xl font-serif font-extrabold text-text-primary">{step.title}</h2>}
      <div className="prose max-w-none text-text-primary text-sm sm:text-base leading-relaxed">
        {renderMarkdown(step.content || '')}
      </div>
      <div className="pt-2">
        <ContinueButton label="Tushundim" onClick={() => onComplete(true)} />
      </div>
    </div>
  );
}

export function CommonMistakesStep({ step, onComplete }: StepProps) {
  return (
    <div className="max-w-[760px] mx-auto w-full space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FDD8C8', color: '#C0432B' }}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-serif font-extrabold text-text-primary">{step.title || 'Tez-tez uchraydigan xatolar'}</h2>
      </div>
      {/* Reddish-tinted container for the mistake content */}
      <div className="rounded-2xl border p-5 sm:p-6 prose max-w-none text-sm sm:text-base leading-relaxed" style={{ backgroundColor: '#FEF2EE', borderColor: '#FDD8C8' }}>
        {renderMarkdown(step.content || '')}
      </div>
      <div className="pt-2">
        <ContinueButton label="Eslab qoldim" onClick={() => onComplete(true)} tone="red" />
      </div>
    </div>
  );
}

export function SummaryStep({ step, onComplete, isLastLesson }: StepProps) {
  return (
    <div className="max-w-[760px] mx-auto w-full space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-serif font-extrabold text-text-primary">{step.title || 'Xulosa'}</h2>
      </div>
      <div className="rounded-2xl border p-5 sm:p-6 prose max-w-none text-sm sm:text-base leading-relaxed" style={{ backgroundColor: '#EAF6F0', borderColor: '#BFE6D4' }}>
        {renderMarkdown(step.content || '')}
      </div>
      <div className="pt-2">
        <ContinueButton label={isLastLesson ? 'Modulni yakunlash' : 'Keyingi darsga oʻtish'} onClick={() => onComplete(true)} tone="green" />
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
    <div className="max-w-[820px] mx-auto w-full space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
          <PlayCircle className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-serif font-extrabold text-text-primary">{step.title || 'Videodars'}</h2>
      </div>
      <div className="aspect-video rounded-2xl overflow-hidden border border-border-card bg-black">
        {embed ? (
          <iframe className="w-full h-full" src={embed} title={step.title || 'video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/70 gap-2">
            <BookOpen className="w-8 h-8" />
            <span className="text-xs">Video havolasi mavjud emas</span>
          </div>
        )}
      </div>
      {step.content && (
        <div className="prose max-w-none text-sm sm:text-base leading-relaxed">{renderMarkdown(step.content)}</div>
      )}
      <div className="pt-2">
        <ContinueButton label="Koʻrdim" onClick={() => onComplete(true)} />
      </div>
    </div>
  );
}

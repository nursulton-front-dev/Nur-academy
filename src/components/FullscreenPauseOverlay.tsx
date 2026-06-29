import { Maximize2, PauseCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface FullscreenPauseOverlayProps {
  /** "Imtihon" or "Test" — used in the headings. */
  label: string;
  exitCount: number;
  maxExits: number;
  /** When true, shows the terminal "auto-finished" message instead of resume. */
  terminated: boolean;
  onResume: () => void;
}

/**
 * Opaque overlay shown when a test leaves fullscreen. Hides the questions and
 * either lets the user return to fullscreen (paused) or shows the auto-finish
 * message once the exit limit is reached (terminated).
 */
export default function FullscreenPauseOverlay({
  label,
  exitCount,
  maxExits,
  terminated,
  onResume,
}: FullscreenPauseOverlayProps) {
  return (
    <div className="fixed inset-0 z-[120] bg-primary-bg/97 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-surface border border-border-card rounded-[24px] max-w-md w-full p-7 sm:p-9 text-center space-y-5 shadow-2xl animate-fadeIn">
        {terminated ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-extrabold text-text-primary">{label} yakunlandi</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Siz ekrandan koʻp marta chiqdingiz, {label.toLowerCase()} avtomatik yakunlandi.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-text-secondary text-sm pt-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Natija saqlanmoqda...</span>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <PauseCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif font-extrabold text-text-primary">{label} toʻxtatildi</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Davom ettirish uchun toʻliq ekranga qayting. Vaqt toʻxtatildi va sizning
                javoblaringiz saqlangan.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Ogohlantirish: {exitCount}/{maxExits}</span>
            </div>

            <button
              onClick={onResume}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent-blue text-white py-3.5 rounded-xl text-sm font-bold hover:bg-accent-blue/95 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Maximize2 className="w-4.5 h-4.5" />
              Toʻliq ekranga qaytish
            </button>
          </>
        )}
      </div>
    </div>
  );
}

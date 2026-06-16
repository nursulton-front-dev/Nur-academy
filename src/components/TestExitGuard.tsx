import React, { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface TestExitGuardProps {
  when: boolean; // guard active while a test is running
}

/**
 * Guards against losing in-progress test answers:
 *  - browser tab close / refresh → native beforeunload confirm
 *  - in-app SPA navigation (back button, links) → app modal
 *
 * Requires a data router (createBrowserRouter) for useBlocker.
 */
export default function TestExitGuard({ when }: TestExitGuardProps) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname
  );

  // Native confirm for tab close / reload.
  useEffect(() => {
    if (!when) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Sizning testingiz tugatilmagan. Chiqishni xohlaysizmi?';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when]);

  // If the guard is lifted (test finished) while a block is pending, release it.
  useEffect(() => {
    if (!when && blocker.state === 'blocked') blocker.reset();
  }, [when, blocker]);

  if (blocker.state !== 'blocked') return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface border border-border-card rounded-[24px] max-w-md w-full p-8 shadow-2xl space-y-6 text-left">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h4 className="font-serif font-extrabold text-lg text-text-primary">Test hali tugamadi</h4>
            <p className="text-xs text-text-secondary">Javoblaringiz saqlanmaydi</p>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          Test hali tugamadi. Chiqsangiz, javoblaringiz saqlanmaydi. Chiqishni xohlaysizmi?
        </p>

        <div className="flex space-x-3 pt-1">
          <button
            onClick={() => blocker.reset?.()}
            className="flex-1 bg-accent-blue hover:bg-accent-blue/95 text-white py-3.5 rounded-xl text-xs font-bold shadow-md shadow-accent-blue/15 transition-all active:scale-98 cursor-pointer"
          >
            Davom etish
          </button>
          <button
            onClick={() => blocker.proceed?.()}
            className="flex-1 border border-border-card hover:bg-rose-500/5 text-rose-500 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Chiqish
          </button>
        </div>
      </div>
    </div>
  );
}

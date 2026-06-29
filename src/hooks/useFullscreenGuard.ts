import { useEffect, useRef, useState } from 'react';

/** Number of fullscreen exits allowed before the test is auto-submitted. */
export const MAX_FULLSCREEN_EXITS = 3;

interface UseFullscreenGuardOptions {
  /** Guard only while the test is actually running (and not yet finished). */
  active: boolean;
  /** Exits allowed before termination. Defaults to MAX_FULLSCREEN_EXITS. */
  maxExits?: number;
  /** Called once the exit limit is reached — should finish + persist the test. */
  onLimitReached: () => void;
}

interface FullscreenGuardState {
  /** True while the user is out of fullscreen but below the exit limit. */
  paused: boolean;
  /** How many times the user has left fullscreen. */
  exitCount: number;
  maxExits: number;
  /** True once the exit limit is hit and the test is being auto-finished. */
  terminated: boolean;
  /** Re-enter fullscreen (must be called from a user gesture). */
  resume: () => void;
}

/**
 * Pauses a test when the user leaves fullscreen and auto-submits after too many
 * exits. Shared by the mock exam and the diagnostic so the behaviour is uniform.
 *
 * Mobile note: if fullscreen was never entered (unsupported), no fullscreenchange
 * events fire, so the guard never falsely pauses — it only reacts to a real
 * fullscreen→windowed transition.
 */
export function useFullscreenGuard({
  active,
  maxExits = MAX_FULLSCREEN_EXITS,
  onLimitReached,
}: UseFullscreenGuardOptions): FullscreenGuardState {
  const [paused, setPaused] = useState(false);
  const [exitCount, setExitCount] = useState(0);
  const [terminated, setTerminated] = useState(false);

  // Refs keep the listener stable while always seeing the latest values.
  const onLimitRef = useRef(onLimitReached);
  onLimitRef.current = onLimitReached;
  const exitCountRef = useRef(0);
  const terminatedRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    const handler = () => {
      if (terminatedRef.current) return;

      if (document.fullscreenElement) {
        // Re-entered fullscreen → resume where we left off.
        setPaused(false);
        return;
      }

      // Left fullscreen → count the exit.
      const next = exitCountRef.current + 1;
      exitCountRef.current = next;
      setExitCount(next);

      if (next >= maxExits) {
        terminatedRef.current = true;
        setTerminated(true);
        setPaused(false);
        onLimitRef.current();
      } else {
        setPaused(true);
      }
    };

    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [active, maxExits]);

  const resume = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  return { paused, exitCount, maxExits, terminated, resume };
}

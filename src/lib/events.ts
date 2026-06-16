// Lightweight in-app event bus (window CustomEvents) for cross-component signals
// that don't warrant a full state library.

// Fired after a diagnostic attempt is finished and enrollment.diagnostic_completed
// is set true, so the course sidebar can refetch and drop its prompt banner.
export const DIAGNOSTIC_COMPLETED_EVENT = 'nur:diagnostic-completed';

export function emitDiagnosticCompleted(): void {
  window.dispatchEvent(new CustomEvent(DIAGNOSTIC_COMPLETED_EVENT));
}

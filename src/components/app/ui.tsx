import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shared internal-app UI primitives. These keep every course page on one visual
 * system: the same metric strip, status chips, section shells, and empty states.
 * All colors flow through the theme tokens (surface / border-card / text-*) so
 * light and dark modes both stay intentional.
 */

type Accent = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'orange';

const ACCENT_TEXT: Record<Accent, string> = {
  blue: 'text-accent-blue',
  green: 'text-emerald-500',
  amber: 'text-amber-500',
  red: 'text-rose-500',
  purple: 'text-purple-500',
  orange: 'text-orange-500',
};

const ACCENT_SOFT_BG: Record<Accent, string> = {
  blue: 'bg-accent-blue/10',
  green: 'bg-emerald-500/10',
  amber: 'bg-amber-500/10',
  red: 'bg-rose-500/10',
  purple: 'bg-purple-500/10',
  orange: 'bg-orange-500/10',
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: Accent;
}

/** Compact KPI tile used in the summary strips at the top of list pages. */
export function MetricCard({ icon, label, value, hint, accent = 'blue' }: MetricCardProps) {
  return (
    <div className="bg-surface border border-border-card rounded-2xl p-4 flex items-start gap-3 transition-all hover:border-accent-blue/40 hover:shadow-sm">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ACCENT_SOFT_BG[accent]} ${ACCENT_TEXT[accent]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary truncate">
          {label}
        </p>
        <p className="text-xl font-serif font-extrabold text-text-primary leading-none">{value}</p>
        {hint && <p className="text-[11px] text-text-secondary truncate">{hint}</p>}
      </div>
    </div>
  );
}

interface SectionCardProps {
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Larger page section shell with an optional header row. */
export function SectionCard({ title, icon, action, children, className = '' }: SectionCardProps) {
  return (
    <section className={`bg-surface border border-border-card rounded-3xl p-5 sm:p-6 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="shrink-0">{icon}</span>}
            {title && (
              <h2 className="font-serif font-bold text-base sm:text-lg text-text-primary truncate">
                {title}
              </h2>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

type StatusVariant = 'completed' | 'open' | 'current' | 'locked' | 'strong' | 'mid' | 'low';

const STATUS_STYLES: Record<StatusVariant, string> = {
  completed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  strong: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  open: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  current: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  mid: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  low: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  locked: 'bg-surface-muted text-text-secondary border-border-card',
};

interface StatusBadgeProps {
  variant: StatusVariant;
  label: string;
  icon?: React.ReactNode;
}

/** Semantic pill (completed / open / locked / strength level). */
export function StatusBadge({ variant, label, icon }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${STATUS_STYLES[variant]}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </span>
  );
}

interface ProgressBarProps {
  value: number; // 0-100
  accent?: Accent;
  className?: string;
}

const ACCENT_BAR: Record<Accent, string> = {
  blue: 'bg-accent-blue',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

export function ProgressBar({ value, accent = 'blue', className = '' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full rounded-full bg-surface-muted overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full ${ACCENT_BAR[accent]} transition-[width] duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  accent?: Accent;
  children?: React.ReactNode;
}

/** Premium empty/zero-data state for pages like the error notebook. */
export function EmptyState({ icon, title, description, accent = 'blue', children }: EmptyStateProps) {
  return (
    <div className="bg-surface border border-border-card rounded-3xl px-6 py-12 sm:py-16 text-center">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${ACCENT_SOFT_BG[accent]} ${ACCENT_TEXT[accent]}`}
      >
        {icon}
      </div>
      <h3 className="mt-5 font-serif font-extrabold text-lg text-text-primary">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto leading-relaxed">{description}</p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

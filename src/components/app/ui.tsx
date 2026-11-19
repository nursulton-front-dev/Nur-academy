import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Loader2, X } from 'lucide-react';

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

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** Unified Breadcrumbs trail for nested screens */
export function Breadcrumbs({ items, className = '' }: { items: BreadcrumbItem[]; className?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-text-secondary ${className}`}>
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-accent-blue transition-colors py-1 focus-visible:outline-2 focus-visible:outline-accent-blue rounded"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Bosh sahifa</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-text-secondary/50 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-text-primary truncate max-w-[200px] sm:max-w-[320px]">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-accent-blue transition-colors truncate max-w-[150px] sm:max-w-[220px] focus-visible:outline-2 focus-visible:outline-accent-blue rounded"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

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
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ACCENT_SOFT_BG[accent]} ${ACCENT_TEXT[accent]}`}
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
    <section className={`bg-surface border border-border-card rounded-3xl p-5 sm:p-6 shadow-xs ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${STATUS_STYLES[variant]}`}
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
  height?: string;
}

const ACCENT_BAR: Record<Accent, string> = {
  blue: 'bg-accent-blue',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-rose-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

export function ProgressBar({ value, accent = 'blue', className = '', height = 'h-2' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`${height} w-full rounded-full bg-surface-muted overflow-hidden ${className}`}>
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

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function AppButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: AppButtonProps) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-sm active:scale-[0.98] border border-transparent',
    secondary:
      'bg-surface-hover text-text-primary hover:bg-surface-muted border border-border-card active:scale-[0.98]',
    outline:
      'bg-transparent text-text-primary hover:bg-surface-hover border border-border-card hover:border-accent-blue/50 active:scale-[0.98]',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent',
    danger:
      'bg-rose-500 text-white hover:bg-rose-600 shadow-sm active:scale-[0.98] border border-transparent',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-surface border border-border-card rounded-3xl ${maxWidth} w-full shadow-2xl overflow-hidden flex flex-col text-left`}
      >
        {(title || description) && (
          <div className="p-6 border-b border-border-card flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              {title && <h3 className="font-serif font-extrabold text-xl text-text-primary">{title}</h3>}
              {description && <p className="text-xs text-text-secondary leading-relaxed">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto max-h-[70vh]">{children}</div>
        {footer && <div className="p-5 bg-primary-bg border-t border-border-card flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

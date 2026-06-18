import React from 'react';

interface AppPageProps {
  children: React.ReactNode;
  /** Dashboard-width container (1360px) vs. standard content width (1100px). */
  wide?: boolean;
  className?: string;
}

/**
 * Consistent internal page container: centered, max-width capped, with the
 * standard horizontal/vertical padding used across every app surface. Keeps
 * content off the sidebar/topbar edges.
 */
export function AppPage({ children, wide = false, className = '' }: AppPageProps) {
  return (
    <div
      className={`mx-auto w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${className}`}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Standard dashboard-style page header: controlled (not oversized) serif title,
 * muted description, optional trailing action. Replaces the old oversized
 * per-page headings so internal pages read as one product.
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div className="space-y-1.5 min-w-0">
        <h1 className="text-xl sm:text-2xl font-serif font-extrabold text-text-primary leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function PageContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}

import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useParams, Navigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronDown,
  FileText,
  X,
  PlayCircle,
  Award,
  Stethoscope,
  BookMarked,
  NotebookPen,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { learningEngineService } from '../lib/learningEngine';
import { useCourse } from '../lib/attestatsiyaCourse';
import { coursePath } from '../lib/courses';
import { enrollmentService } from '../lib/enrollmentService';
import { useAuth } from '../contexts/AuthContext';
import { CourseProvider } from '../contexts/CourseContext';
import AppTopbar from './app/AppTopbar';
import { Seo } from './Seo';
import { courseSeo } from '../lib/seo';

// Width of the fixed course sidebar. Kept ~240px so nav labels never truncate.
const SIDEBAR_WIDTH = 'w-60';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  onNavigate: () => void;
}

function NavItem({ to, icon, label, active, badge, onNavigate }: NavItemProps) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
        active
          ? 'bg-accent-blue/10 text-accent-blue font-semibold'
          : 'text-text-primary hover:bg-surface-hover'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {badge != null && badge > 0 && (
        <span className="text-[9px] font-bold bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded-full shrink-0">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function CourseLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});

  // Course (id, title) + module structure now come from the :slug, not a hardcode.
  const { courseId, title, modules, loading: modulesLoading, error: modulesError, notFound } =
    useCourse(slug);
  const courseModules = modules ?? [];

  // Auto-enroll: a signed-in user who opens a course they aren't enrolled in is
  // silently enrolled (free), so the course always shows up in /dashboard.
  // Idempotent and guarded so it runs at most once per resolved course.
  const autoEnrolledFor = useRef<string | null>(null);
  useEffect(() => {
    if (!user || !courseId) return;
    if (autoEnrolledFor.current === courseId) return;
    autoEnrolledFor.current = courseId;
    enrollmentService.enroll(user.id, courseId, 'free').catch((err) => {
      console.error('CourseLayout auto-enroll failed:', err);
    });
  }, [user, courseId]);

  const reviewCount = learningEngineService.getReviewQueue().length;
  const pathname = location.pathname;
  const base = coursePath(slug ?? '');
  const lessonPrefix = `${base}/dars/`;
  const isActive = (path: string) => pathname === path;

  // Auto-expand the module that owns the active lesson; reset scroll on navigation.
  useEffect(() => {
    if (pathname.startsWith(lessonPrefix)) {
      const lessonId = pathname.slice(lessonPrefix.length);
      const activeModule = courseModules.find((m) => m.lessons.some((l) => l.id === lessonId));
      if (activeModule) setExpandedModules((prev) => ({ ...prev, [activeModule.id]: true }));
    }
  }, [pathname, modules]);

  const activeModuleId = (() => {
    if (pathname.startsWith(lessonPrefix)) {
      const lessonId = pathname.slice(lessonPrefix.length);
      return courseModules.find((m) => m.lessons.some((l) => l.id === lessonId))?.id ?? '';
    }
    return '';
  })();

  const toggleModule = (moduleId: string) =>
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));

  const closeMobile = () => setMobileMenuOpen(false);

  // Unknown slug / unpublished course → send the user to the catalog.
  if (notFound) {
    return <Navigate to="/courses" replace />;
  }

  const sidebarContent = (
    <nav className="flex flex-col gap-5 p-3 font-sans">
      {/* KURS */}
      <div>
        <p className="px-3 text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1.5">
          Kurs
        </p>
        {/* Course title from DB */}
        <p className="px-3 mb-2 text-sm font-serif font-extrabold text-text-primary leading-snug line-clamp-2">
          {title || (modulesLoading ? '…' : 'Kurs')}
        </p>
        <div className="space-y-0.5">
          <NavItem
            to={base}
            icon={<BookOpen className="w-4 h-4" />}
            label="Bosh sahifa"
            active={isActive(base)}
            onNavigate={closeMobile}
          />
          <NavItem
            to={coursePath(slug ?? '', 'natija')}
            icon={<BarChart3 className="w-4 h-4 text-emerald-500" />}
            label="Natija va tahlil"
            active={isActive(coursePath(slug ?? '', 'natija'))}
            onNavigate={closeMobile}
          />
        </div>
      </div>

      <div className="border-t border-border-card/50" />

      {/* MODULLAR */}
      <div>
        <p className="px-3 text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 flex justify-between items-center">
          <span>Modullar</span>
          <span className="text-[8px] bg-accent-blue/10 text-accent-blue px-1.5 py-0.5 rounded-full">
            {modulesLoading ? '…' : courseModules.length}
          </span>
        </p>

        {/* Loading skeleton */}
        {modulesLoading && (
          <div className="space-y-1.5 px-1 py-1" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 rounded-lg bg-surface-hover animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {!modulesLoading && modulesError && (
          <p className="px-3 py-2 text-[11px] font-medium text-error-red leading-snug">
            {modulesError}
          </p>
        )}

        {!modulesLoading && !modulesError && (
          <div className="space-y-0.5">
            {courseModules.map((mod, index) => {
              const isExpanded = !!expandedModules[mod.id];
              const isCompleted = mod.status === 'completed';
              const isCurrent = mod.status === 'current' || activeModuleId === mod.id;
              const isLocked = mod.status === 'locked' && activeModuleId !== mod.id;

              let itemClass = 'hover:bg-surface-hover text-text-primary';
              let badgeClass = 'bg-primary-bg text-text-secondary border border-border-card';
              if (isCurrent) {
                itemClass = 'bg-accent-blue text-white font-semibold shadow-sm';
                badgeClass = 'bg-white/20 text-white';
              } else if (isLocked) {
                itemClass = 'opacity-60 cursor-not-allowed text-text-secondary';
              }

              return (
                <div key={mod.id}>
                  <button
                    onClick={() => !isLocked && toggleModule(mod.id)}
                    disabled={isLocked}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all text-left ${itemClass}`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold shrink-0 ${badgeClass}`}
                      >
                        {index + 1}
                      </span>
                      <span className="truncate">{mod.title.split('. ')[1] || mod.title}</span>
                    </span>
                    <span className="flex items-center gap-0.5 shrink-0 ml-1">
                      {isCompleted && !isCurrent && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success-green" />
                      )}
                      {!isLocked &&
                        (isExpanded ? (
                          <ChevronDown
                            className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-text-secondary'}`}
                          />
                        ) : (
                          <ChevronRight
                            className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-text-secondary'}`}
                          />
                        ))}
                      {isLocked && <Lock className="w-2.5 h-2.5 text-text-secondary" />}
                    </span>
                  </button>

                  {isExpanded && !isLocked && (
                    <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l border-border-card/50 ml-4">
                      {mod.lessons.map((les) => {
                        const lessonHref = coursePath(slug ?? '', `dars/${les.id}`);
                        const lessonActive = pathname === lessonHref;
                        const lessonCompleted = les.status === 'completed';
                        const lessonLocked = les.status === 'locked';

                        let statusIcon = <PlayCircle className="w-3 h-3 text-text-secondary" />;
                        if (lessonCompleted)
                          statusIcon = <CheckCircle2 className="w-3 h-3 text-success-green" />;
                        else if (lessonLocked)
                          statusIcon = (
                            <Lock className="w-2.5 h-2.5 text-text-secondary opacity-50" />
                          );

                        return (
                          <Link
                            key={les.id}
                            to={lessonLocked ? '#' : lessonHref}
                            onClick={(e) => {
                              if (lessonLocked) e.preventDefault();
                              else closeMobile();
                            }}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                              lessonActive
                                ? 'bg-accent-blue/15 text-accent-blue font-semibold'
                                : lessonLocked
                                  ? 'opacity-60 cursor-not-allowed text-text-secondary'
                                  : 'hover:bg-surface-hover text-text-primary'
                            }`}
                          >
                            <span className="shrink-0">{statusIcon}</span>
                            <span className="truncate">{les.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border-card/50" />

      {/* MASHQ — continuation of the same list, no section header */}
      <div className="space-y-0.5">
        <NavItem
          to={coursePath(slug ?? '', 'diagnostika')}
          icon={<Stethoscope className="w-4 h-4 text-purple-500" />}
          label="Diagnostika"
          active={isActive(coursePath(slug ?? '', 'diagnostika'))}
          onNavigate={closeMobile}
        />
        <NavItem
          to={coursePath(slug ?? '', 'testlar')}
          icon={<FileText className="w-4 h-4 text-warning-amber" />}
          label="Mavzu testlari"
          active={isActive(coursePath(slug ?? '', 'testlar'))}
          onNavigate={closeMobile}
        />
        <NavItem
          to={coursePath(slug ?? '', 'imtihon')}
          icon={<Award className="w-4 h-4 text-accent-blue" />}
          label="Mock imtihon"
          active={pathname.startsWith(coursePath(slug ?? '', 'imtihon'))}
          onNavigate={closeMobile}
        />
        <NavItem
          to={coursePath(slug ?? '', 'xatolar')}
          icon={<BookMarked className="w-4 h-4 text-orange-500" />}
          label="Xatolar daftari"
          active={isActive(coursePath(slug ?? '', 'xatolar'))}
          badge={reviewCount}
          onNavigate={closeMobile}
        />
        <NavItem
          to={coursePath(slug ?? '', 'konspektlar')}
          icon={<NotebookPen className="w-4 h-4 text-[#F59E0B]" />}
          label="Mening konspektlarim"
          active={isActive(coursePath(slug ?? '', 'konspektlar'))}
          onNavigate={closeMobile}
        />
        <NavItem
          to={coursePath(slug ?? '', 'obuna')}
          icon={<CreditCard className="w-4 h-4 text-emerald-500" />}
          label="Obuna"
          active={isActive(coursePath(slug ?? '', 'obuna'))}
          onNavigate={closeMobile}
        />
      </div>
    </nav>
  );

  const seo = courseSeo(slug, title);

  return (
    <CourseProvider value={{ slug: slug ?? '', courseId: courseId ?? '', title }}>
      {/* Course-level meta (browser tab + Google). The attestatsiya course keeps
          its "informatika attestatsiya" search keyword here. */}
      <Seo title={seo.title} description={seo.description} rawTitle={seo.rawTitle} canonicalPath={base} />
      {/* AppShell: viewport-locked. The root is exactly 100dvh with overflow hidden,
          the topbar is fixed, and ONLY the main content area scrolls. */}
      <div className="h-dvh overflow-hidden flex flex-col bg-primary-bg font-sans">
        <AppTopbar onMenuClick={() => setMobileMenuOpen((v) => !v)} homeHref={base} />

        <div className="flex flex-1 min-h-0">
          {/* Fixed left sidebar with its own independent scroll */}
          <aside
            className={`hidden md:block ${SIDEBAR_WIDTH} shrink-0 border-r border-border-card bg-surface overflow-y-auto h-full`}
          >
            {sidebarContent}
          </aside>

          {/* Mobile drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={closeMobile}>
              <aside
                className={`${SIDEBAR_WIDTH} h-full bg-surface border-r border-border-card overflow-y-auto shadow-2xl`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-end p-2">
                  <button
                    onClick={closeMobile}
                    className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover"
                    aria-label="Yopish"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {sidebarContent}
              </aside>
            </div>
          )}

          {/* The single page scroll region */}
          <main className="flex-1 min-w-0 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </CourseProvider>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlayCircle, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService } from '../lib/enrollmentService';
import { coursePath, type CourseMeta } from '../lib/courses';

interface CourseStartButtonProps {
  course: CourseMeta;
  /** True when the current user already has an enrollment for this course. */
  enrolled: boolean;
  /** Called after a successful new enrollment so parents can refresh state. */
  onEnrolled?: (courseId: string) => void;
  className?: string;
}

function courseHref(course: CourseMeta): string {
  return course.slug ? coursePath(course.slug) : `/courses/${course.id}`;
}

/**
 * Single source of truth for the course entry action across catalog/landing.
 *  - Guest            → go to login.
 *  - Enrolled         → "Davom etish" (straight into the course).
 *  - Not enrolled     → "Boshlash": create a free enrollment (idempotent), then
 *                       enter the course so it shows up in /dashboard.
 */
export default function CourseStartButton({
  course,
  enrolled,
  onEnrolled,
  className = '',
}: CourseStartButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;

    const href = courseHref(course);

    // Guest → sign in, then return to the course (auto-enroll fires on entry).
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(href)}`);
      return;
    }

    // Already enrolled → just continue.
    if (enrolled) {
      navigate(href);
      return;
    }

    // New free enrollment. enroll() is idempotent on (user, course).
    setBusy(true);
    try {
      await enrollmentService.enroll(user.id, course.id, 'free');
      onEnrolled?.(course.id);
    } catch (err) {
      console.error('CourseStartButton enroll failed:', err);
    } finally {
      setBusy(false);
    }
    navigate(href);
  };

  const label = !user ? 'Boshlash' : enrolled ? 'Davom etish' : 'Boshlash';
  const Icon = !user ? LogIn : enrolled ? ArrowRight : PlayCircle;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={
        className ||
        'w-full inline-flex items-center justify-center gap-2 bg-accent-blue text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-accent-blue/95 transition-all active:scale-[0.98] disabled:opacity-60'
      }
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {busy ? 'Yozilmoqda…' : label}
    </button>
  );
}

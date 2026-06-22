import React, { createContext, useContext } from 'react';

/**
 * Identity of the course currently being viewed under /kurs/:slug.
 * Provided by CourseLayout; consumed by course pages so they can build
 * slug-aware links and (later) drop the hardcoded course_id.
 */
export interface CourseContextValue {
  slug: string;
  courseId: string;
  title: string;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({
  value,
  children,
}: {
  value: CourseContextValue;
  children: React.ReactNode;
}) {
  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

/** Returns the active course context, or null when rendered outside a CourseLayout. */
export function useCourseContext(): CourseContextValue | null {
  return useContext(CourseContext);
}

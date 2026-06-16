import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { enrollmentService } from '../lib/enrollmentService';
import { ATTESTATSIYA_COURSE_ID } from '../lib/courses';
import { diagnosticService, DiagnosticAttempt, DomainResult } from '../lib/diagnosticService';
import { DIAGNOSTIC_DOMAINS } from '../data/diagnosticMockQuestions';
import DiagnosticResultView from '../components/DiagnosticResultView';

// Rebuild ordered DomainResult[] from the stored jsonb map.
function toDomainResults(attempt: DiagnosticAttempt): DomainResult[] {
  const map = attempt.results_by_domain ?? {};
  return DIAGNOSTIC_DOMAINS.map((d) => {
    const entry = map[d.name] ?? { correct: 0, total: d.count, percentage: 0 };
    return { name: d.name, correct: entry.correct, total: entry.total, percentage: entry.percentage };
  });
}

export default function DiagnosticResult() {
  const { user } = useAuth();
  const [attempt, setAttempt] = useState<DiagnosticAttempt | null>(null);
  const [goalScore, setGoalScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      const [latest, enrollment] = await Promise.all([
        diagnosticService.getLatestAttempt(user.id, ATTESTATSIYA_COURSE_ID),
        enrollmentService.getEnrollment(user.id, ATTESTATSIYA_COURSE_ID)
      ]);
      if (!active) return;
      setAttempt(latest);
      setGoalScore(enrollment?.goal_score ?? null);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue" />
      </div>
    );
  }

  // No finished attempt yet — nudge the user to take the test.
  if (!attempt) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5 font-sans">
        <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 flex items-center justify-center mx-auto">
          <Stethoscope className="w-7 h-7 text-accent-blue" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-text-primary">Natija topilmadi</h2>
        <p className="text-sm text-text-secondary">
          Siz hali diagnostika testini topshirmagansiz. Avval testni topshiring.
        </p>
        <Link
          to="/attestatsiya/diagnostika"
          className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/95 text-white px-6 py-3.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <span>Diagnostikani boshlash</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <DiagnosticResultView
      totalScore={attempt.total_score}
      domainResults={toDomainResults(attempt)}
      recommendation={attempt.recommendations ?? ''}
      goalScore={goalScore}
      finishedAt={attempt.finished_at}
    />
  );
}

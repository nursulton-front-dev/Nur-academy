import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { coursePath } from '../lib/courses';
import {
  Lock,
  CheckCircle2,
  FileText,
  ArrowRight,
  Unlock,
  HelpCircle,
  ListChecks,
} from 'lucide-react';
import { mockTopicTests, mockModules } from '../data/attestatsiyaMocks';
import { AppPage, PageContent } from '../components/app/AppPage';
import { HeroPanel } from '../components/brand/Ornaments';
import { MetricCard, StatusBadge } from '../components/app/ui';

export default function AttestatsiyaTests() {
  const navigate = useNavigate();
  const { slug = 'attestatsiya' } = useParams<{ slug: string }>();

  const handleStartExam = (examId: string) => {
    navigate(coursePath(slug, `imtihon/${examId}`));
  };

  const total = mockTopicTests.length;
  const open = mockTopicTests.filter((t) => t.status !== 'locked').length;
  const locked = mockTopicTests.filter((t) => t.status === 'locked').length;
  const totalQuestions = mockTopicTests.reduce((acc, t) => acc + t.questionsCount, 0);

  return (
    <AppPage className="text-left font-sans">
      <PageContent className="space-y-8">
        <HeroPanel
          chip="Mavzu testlari"
          chipIcon={<FileText className="h-4 w-4" />}
          title="Mavzu testlari"
          description="Har bir modul boʻyicha bilimlaringizni sinab koʻring va oʻzlashtirish darajangizni baholang."
          stats={[
            { icon: <FileText className="h-[22px] w-[22px]" />, label: `${total} ta test` },
            { icon: <Unlock className="h-[22px] w-[22px]" />, label: `${open} ta ochiq` },
            { icon: <ListChecks className="h-[22px] w-[22px]" />, label: `${totalQuestions} ta savol` },
          ]}
        />

        {/* Test cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-accent-blue" />
            <h2 className="text-lg sm:text-xl font-serif font-bold text-text-primary">
              Modullar bo‘yicha testlar
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockTopicTests.map((test) => {
              const mod = mockModules.find((m) => m.id === test.moduleId);
              const isCompleted = test.status === 'completed';
              const isLocked = test.status === 'locked';

              return (
                <div
                  key={test.id}
                  className={`group relative rounded-2xl border p-5 flex flex-col transition-all duration-200 ${
                    isLocked
                      ? 'bg-surface/60 border-border-card'
                      : 'bg-surface border-border-card hover:border-accent-blue/50'
                  }`}
                >

                  <div className={`flex flex-col h-full ${isLocked ? 'opacity-60' : ''} ${!isLocked ? 'pl-2' : ''}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs uppercase font-bold tracking-wider text-text-secondary bg-surface-muted px-2 py-0.5 rounded-md">
                        Mavzu testi
                      </span>
                      {isCompleted && (
                        <StatusBadge
                          variant="completed"
                          label={`${test.score}%`}
                          icon={<CheckCircle2 className="w-3 h-3" />}
                        />
                      )}
                      {isLocked && (
                        <StatusBadge variant="locked" label="Yopiq" icon={<Lock className="w-3 h-3" />} />
                      )}
                      {!isCompleted && !isLocked && <StatusBadge variant="open" label="Ochiq" />}
                    </div>

                    <h3 className="font-serif font-bold text-base text-text-primary mb-1 leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-2 mb-4 flex-grow">
                      {mod?.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border-card/60">
                      <span className="text-xs font-semibold text-text-secondary">
                        {test.questionsCount} ta savol
                      </span>
                      {isLocked ? (
                        <span className="text-[13px] text-text-secondary">Oldingi modul yakunlangach ochiladi</span>
                      ) : (
                        <button
                          onClick={() => handleStartExam(test.id)}
                          className="inline-flex items-center gap-1 bg-accent-blue/10 hover:bg-mint text-on-mint font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all active:scale-95"
                        >
                          <span>{isCompleted ? 'Qayta topshirish' : 'Boshlash'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageContent>
    </AppPage>
  );
}

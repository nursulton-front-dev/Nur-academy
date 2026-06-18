import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight
} from 'lucide-react';
import { mockTopicTests, mockModules } from '../data/attestatsiyaMocks';
import { AppPage, PageHeader, PageContent } from '../components/app/AppPage';

export default function AttestatsiyaTests() {
  const navigate = useNavigate();

  const handleStartExam = (examId: string) => {
    navigate(`/attestatsiya/imtihon/${examId}`);
  };

  return (
    <AppPage>
      <PageHeader
        title="Mavzu testlari"
        description="Har bir modul boʻyicha bilimlaringizni sinab koʻring va oʻzlashtirish darajangizni baholang."
      />
      <PageContent>
      {/* Mavzu bo'yicha testlar (Topic Tests) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-[#3B7DD8]" />
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-text-primary">
            Modullar boʻyicha testlar
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockTopicTests.map((test) => {
            const correspondingModule = mockModules.find(m => m.id === test.moduleId);
            const isCompleted = test.status === 'completed';
            const isLocked = test.status === 'locked';

            return (
              <div 
                key={test.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  isLocked 
                    ? 'bg-primary-bg/30 border-border-card/30 opacity-60' 
                    : 'bg-surface border-border-card hover:border-[#3B7DD8] hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-semibold text-text-secondary bg-border-card/40 px-2 py-0.5 rounded-md">
                      Mavzu testi
                    </span>
                    {isCompleted && (
                      <span className="text-xs font-semibold text-[#10B981] flex items-center space-x-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{test.score}% ball</span>
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-text-secondary flex items-center space-x-0.5">
                        <Lock className="w-3 h-3" />
                        <span>Yopiq</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base text-text-primary mb-1">
                    {test.title}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-1 mb-4">
                    {correspondingModule?.description}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-border-card/50">
                  <span className="text-text-secondary">{test.questionsCount} ta savol</span>
                  {!isLocked && (
                    <button
                      onClick={() => handleStartExam(test.id)}
                      className="text-[#3B7DD8] font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <span>{isCompleted ? 'Qayta topshirish' : 'Boshlash'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
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

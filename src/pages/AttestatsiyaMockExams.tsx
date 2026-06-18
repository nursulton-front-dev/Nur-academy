import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Award,
  PlayCircle
} from 'lucide-react';
import { mockExams } from '../data/attestatsiyaMocks';
import { AppPage, PageHeader, PageContent } from '../components/app/AppPage';

export default function AttestatsiyaMockExams() {
  const navigate = useNavigate();

  const handleStartExam = (examId: string) => {
    navigate(`/attestatsiya/imtihon/${examId}`);
  };

  return (
    <AppPage>
      <PageHeader
        title="Mock imtihonlar"
        description="Attestatsiya imtihoni andozasi asosidagi 50 talik sinov testlari. Har bir testga 120 daqiqa ajratiladi."
      />
      <PageContent>
      {/* Mock imtihonlar Grid */}
      <div className="bg-surface rounded-xl border border-border-card divide-y divide-border-card overflow-hidden">
        {mockExams.map((exam) => {
          const isCompleted = exam.status === 'completed';
          const isLocked = exam.status === 'locked';

          return (
            <div 
              key={exam.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${
                isLocked ? 'bg-primary-bg/20 opacity-60' : 'hover:bg-primary-bg/50'
              }`}
            >
              <div className="space-y-1.5 flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-text-primary">
                    {exam.title}
                  </h3>
                  {isCompleted && (
                    <span className="bg-[#10B981]/10 text-[#10B981] text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <Award className="w-3 h-3" />
                      <span>Natija: {exam.score}%</span>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                  <span>Davomiyligi: 120 daqiqa</span>
                  <span>•</span>
                  <span>Savollar soni: {exam.questionsCount} ta</span>
                </div>
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto">
                {isLocked ? (
                  <button
                    disabled
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-primary-bg text-text-secondary px-4 py-2 rounded-lg text-xs font-bold border border-border-card cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Yopiq</span>
                  </button>
                ) : isCompleted ? (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => navigate(`/attestatsiya/imtihon/${exam.id}/natija`)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center bg-surface border border-border-card hover:bg-primary-bg text-text-primary px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Natijani ko'rish
                    </button>
                    <button
                      onClick={() => handleStartExam(exam.id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center bg-[#3B7DD8] hover:bg-opacity-95 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
                    >
                      Qayta topshirish
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-[#3B7DD8] hover:bg-opacity-95 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Imtihonni boshlash</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </PageContent>
    </AppPage>
  );
}

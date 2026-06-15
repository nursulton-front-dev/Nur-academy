import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Lock, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Award,
  PlayCircle
} from 'lucide-react';
import { mockTopicTests, mockExams, mockModules } from '../data/attestatsiyaMocks';

export default function AttestatsiyaTests() {
  const navigate = useNavigate();

  const handleStartExam = (examId: string) => {
    navigate(`/attestatsiya/imtihon/${examId}`);
  };

  return (
    <div className="space-y-10">
      {/* Title Header */}
      <div className="pb-6 border-b border-[#E3EBE9]">
        <h1 className="text-3xl font-serif font-extrabold text-[#1A2E2E] mb-2">
          Testlar va Imtihonlar
        </h1>
        <p className="text-[#5C7370] text-sm sm:text-base">
          Mavzu bo'yicha bilimlaringizni sinab ko'ring va yakuniy 50 talik Mock imtihonlarni topshirib attestatsiyaga tayyorlaning.
        </p>
      </div>

      {/* Mavzu bo'yicha testlar (Topic Tests) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-[#3B7DD8]" />
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A2E2E]">
            Mavzu boʻyicha testlar
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
                    ? 'bg-gray-50/50 border-gray-100 opacity-60' 
                    : 'bg-white border-[#E3EBE9] hover:border-[#3B7DD8] hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-semibold text-[#5C7370] bg-[#E3EBE9]/40 px-2 py-0.5 rounded-md">
                      Mavzu testi
                    </span>
                    {isCompleted && (
                      <span className="text-xs font-semibold text-[#4CAF82] flex items-center space-x-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{test.score}% ball</span>
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-[#5C7370] flex items-center space-x-0.5">
                        <Lock className="w-3 h-3" />
                        <span>Yopiq</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#1A2E2E] mb-1">
                    {test.title}
                  </h3>
                  <p className="text-xs text-[#5C7370] line-clamp-1 mb-4">
                    {correspondingModule?.description}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-[#E3EBE9]/50">
                  <span className="text-[#5C7370]">{test.questionsCount} ta savol</span>
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

      {/* Mock imtihonlar (Mock Exams) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-[#3B7DD8]" />
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A2E2E]">
            Mock imtihonlar
          </h2>
        </div>

        <div className="bg-white rounded-xl border border-[#E3EBE9] divide-y divide-[#E3EBE9] overflow-hidden">
          {mockExams.map((exam) => {
            const isCompleted = exam.status === 'completed';
            const isLocked = exam.status === 'locked';

            return (
              <div 
                key={exam.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${
                  isLocked ? 'bg-gray-50/50 opacity-60' : 'hover:bg-[#F6F9F8]/50'
                }`}
              >
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A2E2E]">
                      {exam.title}
                    </h3>
                    {isCompleted && (
                      <span className="bg-[#4CAF82]/10 text-[#4CAF82] text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <Award className="w-3 h-3" />
                        <span>Natija: {exam.score}%</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-[#5C7370]">
                    <span>Davomiyligi: 120 daqiqa</span>
                    <span>•</span>
                    <span>Savollar soni: {exam.questionsCount} ta</span>
                  </div>
                </div>

                <div className="flex-shrink-0 w-full sm:w-auto">
                  {isLocked ? (
                    <button
                      disabled
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 bg-gray-100 text-[#5C7370] px-4 py-2 rounded-lg text-xs font-bold border border-gray-200 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Yopiq</span>
                    </button>
                  ) : isCompleted ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => navigate(`/attestatsiya/imtihon/${exam.id}/natija`)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center bg-white border border-[#E3EBE9] hover:bg-[#F6F9F8] text-[#1A2E2E] px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
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
      </div>
    </div>
  );
}

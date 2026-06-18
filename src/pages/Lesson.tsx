import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, CheckCircle2, XCircle, Trophy } from 'lucide-react';

interface LessonData {
  id: string;
  module_id: string;
  video_url: string;
  title: string;
  content: string;
  course_id: string;
}

interface Answer {
  id: string;
  text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    async function fetchLesson() {
      if (!lessonId || !user) return;
      try {
        // Fetch lesson
        const { data: lessData, error: lessErr } = await supabase
          .from('lessons')
          .select('*, modules(course_id)')
          .eq('id', lessonId)
          .single();
        if (lessErr) throw lessErr;

        const { data: lessTrans } = await supabase
          .from('lesson_translations')
          .select('*')
          .eq('lesson_id', lessonId)
          .eq('locale', 'uz')
          .single();

        setLesson({
          id: lessData.id,
          module_id: lessData.module_id,
          video_url: lessData.video_url || '',
          title: lessTrans?.title || 'Nomaʼlum dars',
          content: lessTrans?.content || lessData.content || '',
          course_id: lessData.modules?.course_id || ''
        });

        // Fetch Quiz
        const { data: quizData } = await supabase
          .from('quizzes')
          .select('*')
          .eq('lesson_id', lessonId)
          .maybeSingle();

        if (quizData) {
          const { data: qsData } = await supabase
            .from('questions')
            .select('*')
            .eq('quiz_id', quizData.id)
            .order('order_index', { ascending: true });

          if (qsData && qsData.length > 0) {
            const qIds = qsData.map(q => q.id);
            const [{ data: qsTrans }, { data: ansData }, { data: ansTrans }] = await Promise.all([
              supabase.from('question_translations').select('*').in('question_id', qIds).eq('locale', 'uz'),
              supabase.from('answers').select('*').in('question_id', qIds),
              supabase.from('answer_translations').select('*').eq('locale', 'uz')
            ]);

            const loadedQuestions = qsData.map(q => {
              const qT = qsTrans?.find(t => t.question_id === q.id);
              const qAns = (ansData || []).filter(a => a.question_id === q.id);
              return {
                id: q.id,
                text: qT?.question_text || 'Savol topilmadi',
                answers: qAns.map(a => {
                  const aT = ansTrans?.find(t => t.answer_id === a.id);
                  return {
                    id: a.id,
                    text: aT?.answer_text || 'Javob n/a',
                    is_correct: a.is_correct
                  };
                })
              };
            });
            setQuestions(loadedQuestions);
          }
        }
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLesson();
  }, [lessonId, user]);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAnswerSelect = (answerId: string, isCorrect: boolean) => {
    if (isAnswered) return;
    setSelectedAnswerId(answerId);
    setIsAnswered(true);
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(c => c + 1);
      setSelectedAnswerId(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      await saveProgress(score + (questions[currentQuestionIndex].answers.find(a => a.id === selectedAnswerId)?.is_correct ? 1 : 0));
    }
  };

  const saveProgress = async (finalScore: number) => {
    if (!lesson || !user) return;
    setSavingProgress(true);
    try {
      const percentage = questions.length > 0 ? Math.round((finalScore / questions.length) * 100) : 100;
      
      const { error } = await supabase.from('progress').upsert({
        user_id: user.id,
        lesson_id: lesson.id,
        completed: true,
        quiz_score: percentage,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving progress', error);
    } finally {
      setSavingProgress(false);
    }
  };

  const finishWithoutQuiz = async () => {
    await saveProgress(0);
    navigate(`/courses/${lesson?.course_id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-primary-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  if (!lesson) {
    return <div className="p-8 text-center">Dars topilmadi</div>;
  }

  const ytId = extractYoutubeId(lesson.video_url);

  return (
    <div className="bg-primary-bg pb-20">
      <div className="bg-surface border-b border-border-card sticky top-16 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <Link to={`/courses/${lesson.course_id}`} className="text-text-secondary hover:text-text-primary p-2 border border-border-card rounded-lg hover:bg-surface-hover transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-serif font-bold text-text-primary truncate">{lesson.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Video Player */}
        {ytId ? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg mb-8 outline outline-1 outline-border-card">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${ytId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video bg-surface-muted rounded-xl flex items-center justify-center border border-border-card mb-8">
            <p className="text-text-secondary">Video mavjud emas</p>
          </div>
        )}

        {/* Content */}
        <div className="bg-surface p-8 rounded-xl border border-border-card mb-8">
          <h2 className="text-2xl font-serif font-bold text-text-primary mb-6">Dars matni</h2>
          <div className="prose prose-blue max-w-none text-text-secondary whitespace-pre-wrap leading-relaxed">
            {lesson.content || "Matn kiritilmagan"}
          </div>
        </div>

        {/* Quiz Section */}
        {questions.length > 0 && !quizFinished && (
          <div className="bg-surface p-8 rounded-xl border border-border-card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold text-text-primary">Bilimni sinash</h2>
              <span className="text-sm font-medium text-text-secondary bg-surface-muted px-3 py-1 rounded-full">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium text-text-primary mb-6 leading-relaxed">
                {questions[currentQuestionIndex].text}
              </h3>
              
              <div className="space-y-3">
                {questions[currentQuestionIndex].answers.map(answer => {
                  const isSelected = selectedAnswerId === answer.id;
                  let btnClass = "w-full text-left p-4 rounded-xl border text-sm md:text-base transition-all duration-200 flex items-center justify-between";
                  let icon = null;

                  if (isAnswered) {
                    if (answer.is_correct) {
                      btnClass += " border-success-green bg-success-green/10 text-success-green font-medium";
                      icon = <CheckCircle2 className="w-5 h-5 text-success-green" />;
                    } else if (isSelected) {
                      btnClass += " border-error-red bg-error-red/10 text-error-red font-medium";
                      icon = <XCircle className="w-5 h-5 text-error-red" />;
                    } else {
                      btnClass += " border-border-card opacity-50";
                      icon = <div className="w-5 h-5 rounded-full border border-gray-300"></div>;
                    }
                  } else {
                    btnClass += " border-border-card hover:border-accent-blue hover:bg-blue-50/30 text-text-secondary group";
                    icon = <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-accent-blue transition-colors"></div>;
                  }

                  return (
                    <button
                      key={answer.id}
                      disabled={isAnswered}
                      onClick={() => handleAnswerSelect(answer.id, answer.is_correct)}
                      className={btnClass}
                    >
                      <span className="pr-4">{answer.text}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {isAnswered && (
              <div className="flex justify-end border-t border-border-card pt-6">
                <button
                  onClick={handleNextQuestion}
                  className="bg-accent-blue text-white px-8 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-sm"
                >
                  Keyingisi
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quiz Result */}
        {quizFinished && (
          <div className="bg-surface p-10 rounded-xl border border-border-card mb-8 text-center">
            <div className="w-20 h-20 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-accent-blue" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-text-primary mb-2">Test yakunlandi!</h2>
            <p className="text-lg text-text-secondary mb-8">
              Siz {questions.length} ta savoldan {score} tasiga toʻgʻri javob berdingiz.
            </p>
            
            <button
              disabled={savingProgress}
              onClick={() => navigate(`/courses/${lesson?.course_id}`)}
              className="bg-success-green text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-70 inline-flex items-center space-x-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{savingProgress ? 'Saqlanmoqda...' : 'Kursga qaytish'}</span>
            </button>
          </div>
        )}

        {/* No Quiz Fallback */}
        {questions.length === 0 && (
          <div className="flex justify-end mt-8">
            <button
              onClick={finishWithoutQuiz}
              disabled={savingProgress}
              className="bg-accent-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-sm disabled:opacity-70 inline-flex items-center space-x-2"
            >
              <span>{savingProgress ? 'Saqlanmoqda...' : 'Darsni tugatish'}</span>
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

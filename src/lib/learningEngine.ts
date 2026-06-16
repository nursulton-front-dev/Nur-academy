import { userProgressService } from './userProgress';
import { mockModules } from '../data/attestatsiyaMocks';

export interface ErrorRecord {
  questionId: string;
  questionText: string;
  options?: string[];
  userAnswer: any;
  correctAnswer: any;
  explanation: string;
  topic: string;
  subtopic: string;
  difficulty: "easy" | "medium" | "hard" | "exam";
  source: "lesson_quiz" | "mock_exam" | "diagnostic";
  firstWrongAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
  consecutiveCorrect: number;
  mastered: boolean;
  nextReviewAt: string;
}

const ERROR_NOTEBOOK_KEY = 'nur_academy_error_notebook';

// Spaced Repetition Intervals in Days
const REVIEW_INTERVALS = [1, 3, 7, 14];

export const learningEngineService = {
  getErrors(): ErrorRecord[] {
    const data = localStorage.getItem(ERROR_NOTEBOOK_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveErrors(errors: ErrorRecord[]): void {
    localStorage.setItem(ERROR_NOTEBOOK_KEY, JSON.stringify(errors));
  },

  addError(
    questionId: string,
    questionText: string,
    options: string[] | undefined,
    userAnswer: any,
    correctAnswer: any,
    explanation: string,
    topic: string,
    subtopic: string = "",
    difficulty: "easy" | "medium" | "hard" | "exam" = "medium",
    source: "lesson_quiz" | "mock_exam" | "diagnostic" = "lesson_quiz"
  ): void {
    const errors = this.getErrors();
    const existingIdx = errors.findIndex(e => e.questionId === questionId);

    const now = new Date();
    // Schedule first review in 24 hours
    const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (existingIdx > -1) {
      // Update existing error records
      errors[existingIdx].userAnswer = userAnswer;
      errors[existingIdx].consecutiveCorrect = 0; // Reset consecutive correct answers
      errors[existingIdx].mastered = false;
      errors[existingIdx].nextReviewAt = nextReview.toISOString();
      errors[existingIdx].reviewCount += 1;
    } else {
      // Add new error record
      const newRecord: ErrorRecord = {
        questionId,
        questionText,
        options,
        userAnswer,
        correctAnswer,
        explanation,
        topic,
        subtopic,
        difficulty,
        source,
        firstWrongAt: now.toISOString(),
        lastReviewedAt: null,
        reviewCount: 1,
        consecutiveCorrect: 0,
        mastered: false,
        nextReviewAt: nextReview.toISOString()
      };
      errors.push(newRecord);
    }

    this.saveErrors(errors);
  },

  submitErrorReview(questionId: string, isCorrect: boolean): void {
    const errors = this.getErrors();
    const idx = errors.findIndex(e => e.questionId === questionId);

    if (idx > -1) {
      const record = errors[idx];
      const now = new Date();
      record.lastReviewedAt = now.toISOString();
      record.reviewCount += 1;

      if (isCorrect) {
        record.consecutiveCorrect += 1;
        
        // If correct 3 times, mark as mastered
        if (record.consecutiveCorrect >= 3) {
          record.mastered = true;
        } else {
          // Schedule next spaced review interval
          const daysToAdd = REVIEW_INTERVALS[Math.min(record.consecutiveCorrect, REVIEW_INTERVALS.length - 1)];
          const nextReview = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
          record.nextReviewAt = nextReview.toISOString();
        }
      } else {
        record.consecutiveCorrect = 0; // Reset consecutive count
        record.mastered = false;
        // Schedule next review in 1 day again
        const nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        record.nextReviewAt = nextReview.toISOString();
      }

      this.saveErrors(errors);
    }
  },

  getReviewQueue(): ErrorRecord[] {
    const errors = this.getErrors();
    const now = new Date();
    
    // Return all unmastered errors whose nextReviewAt is past/present
    return errors.filter(e => !e.mastered && new Date(e.nextReviewAt) <= now);
  },

  getTodayPlan() {
    const diagnostic = userProgressService.getDiagnosticResult();
    const errorsQueue = this.getReviewQueue();
    const allErrors = this.getErrors();

    // Determine weak topics
    const weakTopics = diagnostic ? diagnostic.weakTopics : ["Python/JS", "Mantiq va sanoq sistemalari"];
    const primaryWeak = weakTopics[0] || "Axborot va kodlash";

    // 1. Dars recommendation
    let recommendedLesson = { id: "l1_1", title: "Axborot, ma'lumot va bilim" };
    
    // Find first unlocked dars belonging to weak topics or modules
    for (const mod of mockModules) {
      const isWeak = weakTopics.some(wt => mod.title.toLowerCase().includes(wt.toLowerCase()));
      if (isWeak || mod.status === 'current') {
        const dars = mod.lessons.find(l => l.status !== 'completed');
        if (dars) {
          recommendedLesson = { id: dars.id, title: dars.title };
          break;
        }
      }
    }

    return {
      recommendations: [
        {
          id: "rec_1",
          type: "dars",
          title: `Mavzu: ${recommendedLesson.title}`,
          desc: `Tavsiya qilingan dars materialini o'qib chiqing.`,
          link: `/attestatsiya/dars/${recommendedLesson.id}`,
          actionText: "Darsga o'tish"
        },
        {
          id: "rec_2",
          type: "quiz",
          title: `${primaryWeak} mavzusida kiber-kviz`,
          desc: "Diagnostika tahliliga ko'ra ushbu bo'limdan 5 ta test yechish.",
          link: `/attestatsiya`,
          actionText: "Darslik"
        },
        {
          id: "rec_3",
          type: "error",
          title: "Xatolar daftarchasidan takrorlash",
          desc: `Bugun takrorlashingiz kerak bo'lgan ${errorsQueue.length} ta savol bor.`,
          link: `/attestatsiya/xatolar`,
          actionText: "Xatolarni ko'rish",
          count: errorsQueue.length
        },
        {
          id: "rec_4",
          type: "exam",
          title: "Mavzuli mini test yechish",
          desc: "O'zlashtirish darajasini oshirish uchun 10 ta savollik test.",
          link: `/attestatsiya/testlar`,
          actionText: "Testlar"
        }
      ]
    };
  }
};

export interface DiagnosticResult {
  score: number;
  totalQuestions: number;
  date: string;
  strongTopics: string[];
  weakTopics: string[];
  moduleScores: Record<string, { correct: number; total: number }>;
}

const GOAL_KEY = 'nur_academy_user_goal';
const POINTS_KEY = 'nur_academy_user_points';
const STREAK_KEY = 'nur_academy_user_streak';
const DIAGNOSTIC_KEY = 'nur_academy_diagnostic_result';
const MASTERY_KEY = 'nur_academy_topic_mastery';

export const goalOptions = [
  { value: 55, label: "55+ — Attestatsiyadan o'tish", title: "Attestatsiyadan o'tish" },
  { value: 60, label: "60+ — Ikkinchi toifa", title: "Ikkinchi toifa" },
  { value: 70, label: "70+ — Birinchi toifa", title: "Birinchi toifa" },
  { value: 80, label: "80+ — Oliy toifa", title: "Oliy toifa" },
  { value: 86, label: "86+ — TOP natija (Ustama target)", title: "TOP natija" }
];

export const userProgressService = {
  getUserGoal(): number | null {
    const val = localStorage.getItem(GOAL_KEY);
    return val ? parseInt(val, 10) : null;
  },

  setUserGoal(goal: number): void {
    localStorage.setItem(GOAL_KEY, String(goal));
  },

  getPoints(): number {
    return parseInt(localStorage.getItem(POINTS_KEY) || '0', 10);
  },

  addPoints(amount: number): void {
    const current = this.getPoints();
    localStorage.setItem(POINTS_KEY, String(current + amount));
  },

  getStreak(): number {
    return parseInt(localStorage.getItem(STREAK_KEY) || '1', 10);
  },

  setStreak(val: number): void {
    localStorage.setItem(STREAK_KEY, String(val));
  },

  getDiagnosticResult(): DiagnosticResult | null {
    const val = localStorage.getItem(DIAGNOSTIC_KEY);
    return val ? JSON.parse(val) : null;
  },

  setDiagnosticResult(result: DiagnosticResult): void {
    localStorage.setItem(DIAGNOSTIC_KEY, JSON.stringify(result));
    
    // Auto-update topic mastery based on diagnostic breakdown
    const mastery: Record<string, number> = {};
    Object.entries(result.moduleScores).forEach(([modId, stats]) => {
      const percentage = Math.round((stats.correct / stats.total) * 100);
      mastery[modId] = percentage;
    });
    localStorage.setItem(MASTERY_KEY, JSON.stringify(mastery));
  },

  getTopicMastery(): Record<string, number> {
    const val = localStorage.getItem(MASTERY_KEY);
    return val ? JSON.parse(val) : {};
  },

  setTopicMastery(mastery: Record<string, number>): void {
    localStorage.setItem(MASTERY_KEY, JSON.stringify(mastery));
  },

  clearAllProgress(): void {
    localStorage.removeItem(GOAL_KEY);
    localStorage.removeItem(POINTS_KEY);
    localStorage.removeItem(STREAK_KEY);
    localStorage.removeItem(DIAGNOSTIC_KEY);
    localStorage.removeItem(MASTERY_KEY);
  }
};

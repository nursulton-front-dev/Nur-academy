export type SubscriptionTier = 'free' | 'start' | 'pro' | 'oliy' | 'vip';

export interface SubscriptionLimits {
  diagnosticLimit: number;
  mockExamLimit: number;
  lessonsLimit: number; // e.g. first 2 modules free
  hasErrorNotebook: boolean;
  hasAdvancedAnalytics: boolean;
  hasPersonalRoadmap: boolean;
  hasAiMentor: boolean;
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    diagnosticLimit: 1,
    mockExamLimit: 2,
    lessonsLimit: 2, // m1 and m2 are free
    hasErrorNotebook: false,
    hasAdvancedAnalytics: false,
    hasPersonalRoadmap: false,
    hasAiMentor: false,
  },
  start: {
    diagnosticLimit: 2,
    mockExamLimit: 5,
    lessonsLimit: 4, // m1 - m4 free
    hasErrorNotebook: true,
    hasAdvancedAnalytics: false,
    hasPersonalRoadmap: false,
    hasAiMentor: false,
  },
  pro: {
    diagnosticLimit: 999,
    mockExamLimit: 15,
    lessonsLimit: 8, // All modules
    hasErrorNotebook: true,
    hasAdvancedAnalytics: true,
    hasPersonalRoadmap: true,
    hasAiMentor: false,
  },
  oliy: {
    diagnosticLimit: 999,
    mockExamLimit: 999,
    lessonsLimit: 8,
    hasErrorNotebook: true,
    hasAdvancedAnalytics: true,
    hasPersonalRoadmap: true,
    hasAiMentor: true,
  },
  vip: {
    diagnosticLimit: 999,
    mockExamLimit: 999,
    lessonsLimit: 8,
    hasErrorNotebook: true,
    hasAdvancedAnalytics: true,
    hasPersonalRoadmap: true,
    hasAiMentor: true,
  }
};

const TIER_KEY = 'nur_academy_subscription_tier';
const MOCK_COUNT_KEY = 'nur_academy_mock_exam_count';
const DIAGNOSTIC_COUNT_KEY = 'nur_academy_diagnostic_count';

export const subscriptionService = {
  getSubscriptionTier(): SubscriptionTier {
    const tier = localStorage.getItem(TIER_KEY) as SubscriptionTier;
    return tier || 'free';
  },

  setSubscriptionTier(tier: SubscriptionTier): void {
    localStorage.setItem(TIER_KEY, tier);
  },

  getLimits(): SubscriptionLimits {
    const tier = this.getSubscriptionTier();
    return TIER_LIMITS[tier];
  },

  getDiagnosticUsage(): number {
    return Number(localStorage.getItem(DIAGNOSTIC_COUNT_KEY) || '0');
  },

  incrementDiagnosticUsage(): void {
    const current = this.getDiagnosticUsage();
    localStorage.setItem(DIAGNOSTIC_COUNT_KEY, String(current + 1));
  },

  getMockExamUsage(): number {
    return Number(localStorage.getItem(MOCK_COUNT_KEY) || '0');
  },

  incrementMockExamUsage(): void {
    const current = this.getMockExamUsage();
    localStorage.setItem(MOCK_COUNT_KEY, String(current + 1));
  },

  isFeatureLocked(feature: keyof SubscriptionLimits): boolean {
    const limits = this.getLimits();
    const val = limits[feature];
    if (typeof val === 'boolean') {
      return !val;
    }
    return false;
  },

  isLessonLocked(moduleId: string): boolean {
    const limits = this.getLimits();
    const allowedModulesCount = limits.lessonsLimit;
    
    // Module ID matches 'm1', 'm2' etc. Extract number
    const match = moduleId.match(/\d+/);
    if (!match) return false;
    const num = parseInt(match[0], 10);
    
    return num > allowedModulesCount;
  },

  isMockExamLocked(completedCount: number): boolean {
    const limits = this.getLimits();
    return completedCount >= limits.mockExamLimit;
  },

  resetUsage(): void {
    localStorage.setItem(MOCK_COUNT_KEY, '0');
    localStorage.setItem(DIAGNOSTIC_COUNT_KEY, '0');
  }
};

/**
 * Personalization & Route Building Engine — Geografiya 2026
 * Nur Academy - Lead Full-Stack Architect
 *
 * Implements Phase 4:
 * - Deterministic S1-S10 classification (past <50%, o‘rta 50%..<80%, yuqori >=80%)
 * - Prerequisites-preserving weak-sections-first routing
 * - Oddiy module pair gating
 * - Real mock readiness evaluator (2 fresh independent Real >= 86 -> Tayyor)
 * - Factual range indicator with mandatory legal disclaimers
 */

import { GEOGRAFIYA_SECTIONS, SectionBreakdown, GeografiyaLesson, geografiyaService } from './geografiyaService';

export interface RouteStep {
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  moduleTitle: string;
  sectionNumber: number;
  sectionTitle: string;
  mode: 'full' | 'summary'; // full for past/o‘rta, summary for yuqori
  status: 'locked' | 'available' | 'completed';
  orderIndex: number;
}

export interface ReadinessEvaluation {
  status: 'boshlang‘ich' | 'jarayonda' | 'tayyor' | 'variantlar_tugadi';
  titleUz: string;
  descriptionUz: string;
  lastScore: number | null;
  observedRange: { min: number; max: number } | null;
  isTayyor: boolean;
  freshAttemptsCount: number;
  exhausted: boolean;
  disclaimer: string;
}

export const LEGAL_DISCLAIMER =
  "Ushbu ball platformadagi sinov natijasidir va davlat attestatsiyasida toifa yoki ustama berilishini kafolatlamaydi (Vazirlar Mahkamasining 572-son qarori talablari asosida).";

export const personalizationService = {
  /**
   * Evaluates exact score level on unrounded fraction:
   * past: < 0.50
   * o‘rta: >= 0.50 and < 0.80
   * yuqori: >= 0.80
   */
  classifyLevel(correct: number, total: number): 'past' | 'o‘rta' | 'yuqori' {
    if (total <= 0) return 'past';
    const fraction = correct / total;
    if (fraction < 0.50) return 'past';
    if (fraction < 0.80) return 'o‘rta';
    return 'yuqori';
  },

  /**
   * Builds personalized route:
   * Weak sections (<50% and 50-79%) prioritized, but prerequisite order
   * between modules (M1 before M2..M8) is strictly preserved.
   */
  buildLearningRoute(
    sectionResults: SectionBreakdown[] | null,
    completedLessonIds: string[] = []
  ): RouteStep[] {
    const allLessons = geografiyaService.getLessons();
    const completedSet = new Set(completedLessonIds);

    const sectionLevelMap: Record<number, 'past' | 'o‘rta' | 'yuqori'> = {};
    if (sectionResults && sectionResults.length > 0) {
      for (const s of sectionResults) {
        sectionLevelMap[s.sectionNumber] = s.level;
      }
    }

    // Sort lessons preserving module order (prerequisites), but within modules or
    // across flexible boundaries, lessons belonging to weaker sections get priority
    const sortedLessons = [...allLessons].sort((a, b) => {
      // Primary sort: module order (strictly preserves pedagogical prerequisites)
      const modA = parseInt(a.moduleId.replace('M', ''), 10) || 1;
      const modB = parseInt(b.moduleId.replace('M', ''), 10) || 1;
      if (modA !== modB) return modA - modB;

      // Secondary sort: within the same module, weak sections come first
      const levelA = sectionLevelMap[a.specSection] || 'past';
      const levelB = sectionLevelMap[b.specSection] || 'past';
      const priorityOrder = { past: 0, 'o‘rta': 1, yuqori: 2 };
      if (priorityOrder[levelA] !== priorityOrder[levelB]) {
        return priorityOrder[levelA] - priorityOrder[levelB];
      }

      // Tertiary sort: lesson orderIndex
      return a.orderIndex - b.orderIndex;
    });

    let previousCompleted = true;

    return sortedLessons.map((l, idx) => {
      const isDone = completedSet.has(l.id);
      const isAvailable = previousCompleted || isDone;
      if (!isDone) {
        previousCompleted = false; // subsequent lessons are locked until current is done
      }

      const level = sectionLevelMap[l.specSection] || 'past';
      const mode: 'full' | 'summary' = level === 'yuqori' ? 'summary' : 'full';

      return {
        lessonId: l.id,
        lessonTitle: l.title,
        moduleId: l.moduleId,
        moduleTitle: l.moduleTitle,
        sectionNumber: l.specSection,
        sectionTitle: GEOGRAFIYA_SECTIONS[l.specSection] || `Bo‘lim ${l.specSection}`,
        mode,
        status: isDone ? 'completed' : isAvailable ? 'available' : 'locked',
        orderIndex: idx + 1
      };
    });
  },

  /**
   * Evaluates Tayyor readiness:
   * Rule: Two consecutive fresh independent Real mock attempts with score >= 86
   * Repeat attempts on previously seen variants do NOT count as fresh.
   */
  evaluateReadiness(
    realAttempts: Array<{ variant: string; score: number; date: string; isFresh: boolean }>
  ): ReadinessEvaluation {
    if (!realAttempts || realAttempts.length === 0) {
      return {
        status: 'boshlang‘ich',
        titleUz: 'Boshlang‘ich sinovdan boshlang',
        descriptionUz: 'Tayyorgarlik darajangizni aniqlash uchun Real mock A diagnostikasini topshiring.',
        lastScore: null,
        observedRange: null,
        isTayyor: false,
        freshAttemptsCount: 0,
        exhausted: false,
        disclaimer: LEGAL_DISCLAIMER
      };
    }

    // Filter fresh independent attempts
    const freshAttempts = realAttempts.filter((a) => a.isFresh);
    const lastAttempt = realAttempts[realAttempts.length - 1];
    const scores = realAttempts.map((a) => a.score);

    // Observed range
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const observedRange = scores.length >= 2 ? { min: minScore, max: maxScore } : null;

    // Check distinct fresh variants completed
    const completedVariants = new Set(realAttempts.map((a) => a.variant));
    const allVariantsUsed = ['A', 'B', 'C'].every((v) => completedVariants.has(v));

    // Check two consecutive fresh attempts >= 86
    let isTayyor = false;
    if (freshAttempts.length >= 2) {
      const len = freshAttempts.length;
      const att1 = freshAttempts[len - 2];
      const att2 = freshAttempts[len - 1];
      if (att1.score >= 86 && att2.score >= 86 && att1.variant !== att2.variant) {
        isTayyor = true;
      }
    }

    if (isTayyor) {
      return {
        status: 'tayyor',
        titleUz: 'Tayyor (86+ ball ko‘rsatkichi)',
        descriptionUz: 'Siz ketma-ket 2 ta yangi mustaqil Real mockda 86+ ball to‘pladingiz. Bilimlaringizni ishonch bilan takrorlang.',
        lastScore: lastAttempt.score,
        observedRange,
        isTayyor: true,
        freshAttemptsCount: freshAttempts.length,
        exhausted: allVariantsUsed,
        disclaimer: LEGAL_DISCLAIMER
      };
    }

    if (allVariantsUsed) {
      return {
        status: 'variantlar_tugadi',
        titleUz: 'Barcha yangi variantlar topshirildi',
        descriptionUz: 'A, B va C variantlari topshirilgan. Yangi mustaqil variantlar mavjud emas. Xatolar ustida ishlab, variantlarni qayta topshirishingiz mumkin (Takroriy urinish).',
        lastScore: lastAttempt.score,
        observedRange,
        isTayyor: false,
        freshAttemptsCount: freshAttempts.length,
        exhausted: true,
        disclaimer: LEGAL_DISCLAIMER
      };
    }

    return {
      status: 'jarayonda',
      titleUz: 'Tayyorgarlik jarayonida',
      descriptionUz: `Oxirgi natija: ${lastAttempt.score} ball. Tayyor maqomiga erishish uchun ketma-ket 2 ta yangi Real mockda kamida 86 ball kerak.`,
      lastScore: lastAttempt.score,
      observedRange,
      isTayyor: false,
      freshAttemptsCount: freshAttempts.length,
      exhausted: false,
      disclaimer: LEGAL_DISCLAIMER
    };
  }
};

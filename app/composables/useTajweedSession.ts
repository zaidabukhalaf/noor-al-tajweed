/**
 * useTajweedSession Composable
 *
 * Central session state manager for recitation sessions.
 * Handles current position, highlights, analysis, and session lifecycle.
 *
 * Phase 4: Integrates with structured TajweedAnalysisResponse
 *
 * @module composables/useTajweedSession
 */

import type {
  WordHighlight,
  HighlightStatus,
  TajweedRule,
  SessionSummary,
} from "~/types";

import type {
  TajweedAnalysisResponse,
  TajweedWordFeedback,
  TajweedRuleId,
} from "~/types/tajweed";

export function useTajweedSession() {
  // ==========================================
  // Session State
  // ==========================================

  const isActive = ref(false);
  const isPaused = ref(false);

  // Current position
  const currentSurahNumber = ref(1);
  const ayahRange = ref<[number, number]>([1, 7]);
  const currentAyahIndex = ref(0);
  const currentWordIndex = ref(-1);

  // Session timing
  const startTime = ref<Date | null>(null);
  const endTime = ref<Date | null>(null);

  // Word highlights: Map<globalWordIndex, WordHighlight>
  const highlights = ref<Map<number, WordHighlight>>(new Map());

  // Statistics
  const totalWords = ref(0);
  const processedWords = ref(0);

  // ==========================================
  // Phase 4: Structured Analysis State
  // ==========================================

  /** Current analysis response from the structured API */
  const currentAnalysis = ref<TajweedAnalysisResponse | null>(null);

  /** Loading state for analysis fetch */
  const isAnalyzing = ref(false);

  /** Error from analysis fetch */
  const analysisError = ref<string | null>(null);

  // ==========================================
  // Utility Functions
  // ==========================================

  /**
   * Create a unique key for a word position
   */
  function getWordKey(ayahIndex: number, wordIndex: number): number {
    return ayahIndex * 1000 + wordIndex;
  }

  /**
   * Convert TajweedRuleId to TajweedRule (legacy type compatibility)
   */
  function convertRuleId(ruleId: TajweedRuleId): TajweedRule {
    // Map new rule IDs to legacy enum
    const mapping: Record<string, TajweedRule> = {
      ghunnah: "ghunnah",
      madd_tabii: "madd_tabii",
      madd_lazim: "madd_lazim",
      madd_muttasil: "madd_muttasil",
      madd_munfasil: "madd_munfasil",
      madd_arid: "madd_tabii", // fallback
      madd_lin: "madd_tabii", // fallback
      idgham_bi_ghunnah: "idgham_bi_ghunnah",
      idgham_bila_ghunnah: "idgham_bila_ghunnah",
      ikhfa: "ikhfa",
      ikhfa_shafawi: "ikhfa", // fallback
      iqlab: "iqlab",
      izhar: "izhar",
      izhar_shafawi: "izhar", // fallback
      qalqalah: "qalqalah",
      makhraj: "makhraj",
    };
    return mapping[ruleId] || "makhraj";
  }

  // ==========================================
  // Session Lifecycle
  // ==========================================

  /**
   * Start a new recitation session
   */
  function startSession(surahNumber: number, range?: [number, number]) {
    // Reset state
    highlights.value.clear();
    currentSurahNumber.value = surahNumber;
    ayahRange.value = range ?? [1, 7];
    currentAyahIndex.value = 0;
    currentWordIndex.value = -1;
    totalWords.value = 0;
    processedWords.value = 0;

    // Reset analysis state
    currentAnalysis.value = null;
    analysisError.value = null;

    // Start timing
    startTime.value = new Date();
    endTime.value = null;

    // Activate session
    isActive.value = true;
    isPaused.value = false;
  }

  /**
   * Pause the session
   */
  function pauseSession() {
    isPaused.value = true;
  }

  /**
   * Resume the session
   */
  function resumeSession() {
    isPaused.value = false;
  }

  /**
   * Stop the session and return summary
   */
  function stopSession(): SessionSummary | null {
    if (!startTime.value) return null;

    endTime.value = new Date();
    isActive.value = false;
    isPaused.value = false;

    return generateSummary();
  }

  // ==========================================
  // Phase 4: Structured Analysis Integration
  // ==========================================

  /**
   * Fetch structured tajweed analysis for an ayah.
   * This calls the new /api/tajweed/analyze-structured endpoint.
   */
  async function fetchStructuredAnalysis(
    surahNumber: number,
    ayahNumber: number,
    ayahText: string
  ): Promise<TajweedAnalysisResponse | null> {
    isAnalyzing.value = true;
    analysisError.value = null;

    try {
      const response = await $fetch<TajweedAnalysisResponse>(
        "/api/tajweed/analyze-structured",
        {
          method: "POST",
          body: {
            surahNumber,
            ayahNumber,
            ayahText,
          },
        }
      );

      currentAnalysis.value = response;
      return response;
    } catch (err) {
      const e = err as Error;
      analysisError.value = `Analysis error: ${e.message}`;
      console.error("Tajweed analysis failed:", e);
      return null;
    } finally {
      isAnalyzing.value = false;
    }
  }

  /**
   * Apply analysis feedback to highlights.
   * Converts TajweedAnalysisResponse to the highlights Map.
   */
  function applyAnalysisToHighlights(analysis: TajweedAnalysisResponse) {
    const ayahIndex = currentAyahIndex.value;

    for (const fb of analysis.feedback) {
      const key = getWordKey(ayahIndex, fb.wordIndex);

      // Convert status
      const status: HighlightStatus =
        fb.status === "correct"
          ? "correct"
          : fb.status === "warning"
          ? "warning"
          : "error";

      // Convert rules
      const rules: TajweedRule[] = [];
      if (fb.rulesApplied) {
        for (const ruleId of fb.rulesApplied) {
          rules.push(convertRuleId(ruleId));
        }
      }

      // Build message from issues
      const messages = fb.issues.map((issue) => issue.messageAr);
      const message = messages.length > 0 ? messages.join("؛ ") : undefined;

      highlights.value.set(key, {
        status,
        rules: rules.length > 0 ? rules : undefined,
        message,
      });
    }

    // Update stats
    totalWords.value = analysis.summary.totalWords;
    processedWords.value = analysis.summary.totalWords;
  }

  /**
   * Start recitation for an ayah using the structured analysis.
   * Returns a timing runner that can be used to drive word-by-word highlighting.
   */
  function createAnalysisTimingRunner(
    analysis: TajweedAnalysisResponse,
    onWordStart: (wordIndex: number) => void,
    onWordEnd: (wordIndex: number, feedback: TajweedWordFeedback) => void,
    onComplete: () => void
  ) {
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    let isRunning = false;

    function start() {
      if (isRunning) return;
      isRunning = true;

      // Use alignments for timing
      for (const alignment of analysis.alignments) {
        const wordIndex = alignment.quranWordIndex;
        const feedback = analysis.feedback[wordIndex];

        // Word start
        const startTimeout = setTimeout(() => {
          if (isRunning) {
            onWordStart(wordIndex);
          }
        }, alignment.startTimeMs);

        // Word end
        const endTimeout = setTimeout(() => {
          if (isRunning && feedback) {
            onWordEnd(wordIndex, feedback);
          }
        }, alignment.endTimeMs);

        timeouts.push(startTimeout, endTimeout);
      }

      // Schedule completion
      if (analysis.alignments.length > 0) {
        const lastAlignment =
          analysis.alignments[analysis.alignments.length - 1]!;
        const completeTimeout = setTimeout(() => {
          if (isRunning) {
            isRunning = false;
            onComplete();
          }
        }, lastAlignment.endTimeMs + 500);

        timeouts.push(completeTimeout);
      }
    }

    function stop() {
      isRunning = false;
      for (const timeout of timeouts) {
        clearTimeout(timeout);
      }
      timeouts = [];
    }

    return { start, stop, isRunning: () => isRunning };
  }

  // ==========================================
  // Word Highlighting
  // ==========================================

  /**
   * Update the current word being recited
   */
  function setCurrentWord(ayahIndex: number, wordIndex: number) {
    // Mark previous current word as processed
    if (currentWordIndex.value >= 0) {
      const prevKey = getWordKey(
        currentAyahIndex.value,
        currentWordIndex.value
      );
      const prevHighlight = highlights.value.get(prevKey);
      if (prevHighlight && prevHighlight.status === "current") {
        if (!prevHighlight.rules?.length) {
          highlights.value.set(prevKey, { ...prevHighlight, status: "idle" });
        }
      }
    }

    currentAyahIndex.value = ayahIndex;
    currentWordIndex.value = wordIndex;

    // Set new current word
    const key = getWordKey(ayahIndex, wordIndex);
    const existing = highlights.value.get(key);
    highlights.value.set(key, {
      ...existing,
      status: "current",
    });
  }

  /**
   * Set a specific word's highlight status
   */
  function setWordHighlight(
    ayahIndex: number,
    wordIndex: number,
    status: HighlightStatus,
    rules?: TajweedRule[],
    message?: string
  ) {
    const key = getWordKey(ayahIndex, wordIndex);
    highlights.value.set(key, { status, rules, message });
  }

  /**
   * Get highlight for a specific word
   */
  function getWordHighlight(
    ayahIndex: number,
    wordIndex: number
  ): WordHighlight | undefined {
    const key = getWordKey(ayahIndex, wordIndex);
    return highlights.value.get(key);
  }

  // ==========================================
  // Navigation
  // ==========================================

  /**
   * Move to next ayah
   */
  function nextAyah(): boolean {
    const [start, end] = ayahRange.value;
    const maxIndex = end - start;

    if (currentAyahIndex.value < maxIndex) {
      currentAyahIndex.value++;
      currentWordIndex.value = -1;
      currentAnalysis.value = null; // Clear analysis for new ayah
      return true;
    }
    return false;
  }

  /**
   * Move to previous ayah
   */
  function prevAyah(): boolean {
    if (currentAyahIndex.value > 0) {
      currentAyahIndex.value--;
      currentWordIndex.value = -1;
      currentAnalysis.value = null; // Clear analysis for new ayah
      return true;
    }
    return false;
  }

  /**
   * Get the current ayah number (1-indexed)
   */
  const currentAyahNumber = computed(() => {
    return ayahRange.value[0] + currentAyahIndex.value;
  });

  // ==========================================
  // Summary Generation
  // ==========================================

  /**
   * Generate session summary
   * Always computes from highlights which accumulate across all ayat
   */
  function generateSummary(): SessionSummary {
    let correctCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    const ruleBreakdown: Record<
      TajweedRule,
      { correct: number; errors: number }
    > = {} as any;

    // Compute from highlights - this accumulates across all ayat
    highlights.value.forEach((highlight) => {
      switch (highlight.status) {
        case "correct":
          correctCount++;
          break;
        case "warning":
          warningCount++;
          break;
        case "error":
          errorCount++;
          break;
        // "current" and "idle" are not counted as they're transitional
      }

      if (highlight.rules) {
        for (const rule of highlight.rules) {
          if (!ruleBreakdown[rule]) {
            ruleBreakdown[rule] = { correct: 0, errors: 0 };
          }
          if (highlight.status === "correct") {
            ruleBreakdown[rule].correct++;
          } else if (
            highlight.status === "warning" ||
            highlight.status === "error"
          ) {
            ruleBreakdown[rule].errors++;
          }
        }
      }
    });

    const total = correctCount + warningCount + errorCount;

    // Score formula: correct=100%, warning=50%, error=0%
    const overallScore =
      total > 0
        ? Math.round(
            (correctCount * 100 + warningCount * 50 + errorCount * 0) / total
          )
        : 0;

    const duration =
      endTime.value && startTime.value
        ? endTime.value.getTime() - startTime.value.getTime()
        : 0;

    return {
      id: crypto.randomUUID(),
      timestamp: startTime.value ?? new Date(),
      surahNumber: currentSurahNumber.value,
      surahName: "",
      ayahRange: ayahRange.value,
      totalWords: total,
      correctCount,
      warningCount,
      errorCount,
      ruleBreakdown,
      overallScore,
      duration,
    };
  }

  /**
   * Reset the session completely
   */
  function resetSession() {
    isActive.value = false;
    isPaused.value = false;
    currentSurahNumber.value = 1;
    ayahRange.value = [1, 7];
    currentAyahIndex.value = 0;
    currentWordIndex.value = -1;
    highlights.value.clear();
    startTime.value = null;
    endTime.value = null;
    totalWords.value = 0;
    processedWords.value = 0;
    currentAnalysis.value = null;
    analysisError.value = null;
  }

  // ==========================================
  // Computed Properties
  // ==========================================

  /**
   * Real-time tajweed score (0-1).
   * Uses analysis summary if available, otherwise computes from highlights.
   */
  const tajweedScore = computed(() => {
    // Use structured analysis score if available
    if (currentAnalysis.value) {
      return currentAnalysis.value.summary.overallScore / 100;
    }

    // Fallback: compute from highlights
    let correct = 0;
    let warning = 0;
    let error = 0;

    highlights.value.forEach((highlight) => {
      switch (highlight.status) {
        case "correct":
          correct++;
          break;
        case "warning":
          warning++;
          break;
        case "error":
          error++;
          break;
      }
    });

    const total = correct + warning + error;
    if (total === 0) return 0.5; // Neutral score when no data

    // Weighted score: correct=1, warning=0.5, error=0
    return (correct * 1 + warning * 0.5 + error * 0) / total;
  });

  /**
   * Current word feedback from analysis (for tooltips)
   */
  const currentWordFeedback = computed(() => {
    if (!currentAnalysis.value || currentWordIndex.value < 0) {
      return null;
    }
    return currentAnalysis.value.feedback[currentWordIndex.value] ?? null;
  });

  /**
   * Get feedback for a specific word index
   */
  function getWordFeedback(wordIndex: number): TajweedWordFeedback | null {
    if (!currentAnalysis.value) return null;
    return currentAnalysis.value.feedback[wordIndex] ?? null;
  }

  // ==========================================
  // Exports
  // ==========================================

  return {
    // Session State
    isActive: readonly(isActive),
    isPaused: readonly(isPaused),
    currentSurahNumber: readonly(currentSurahNumber),
    ayahRange: readonly(ayahRange),
    currentAyahIndex: readonly(currentAyahIndex),
    currentAyahNumber,
    currentWordIndex: readonly(currentWordIndex),
    highlights: readonly(highlights),
    startTime: readonly(startTime),
    totalWords: readonly(totalWords),
    processedWords: readonly(processedWords),

    // Phase 4: Structured Analysis
    currentAnalysis: readonly(currentAnalysis),
    isAnalyzing: readonly(isAnalyzing),
    analysisError: readonly(analysisError),
    currentWordFeedback,

    // Computed
    tajweedScore,

    // Session Lifecycle
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    resetSession,

    // Phase 4: Analysis Methods
    fetchStructuredAnalysis,
    applyAnalysisToHighlights,
    createAnalysisTimingRunner,
    getWordFeedback,

    // Highlighting
    setCurrentWord,
    setWordHighlight,
    getWordHighlight,

    // Navigation
    nextAyah,
    prevAyah,
  };
}

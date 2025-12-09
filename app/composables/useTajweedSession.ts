/**
 * useTajweedSession Composable
 *
 * Central session state manager for recitation sessions.
 * Handles current position, highlights, and session lifecycle.
 */

import type {
  WordHighlight,
  HighlightStatus,
  TajweedTokenFeedback,
  SessionSummary,
  TajweedRule,
} from "~/types";

export function useTajweedSession() {
  // Session state
  const isActive = ref(false);
  const isPaused = ref(false);

  // Current position
  const currentSurahNumber = ref(1); // Default to Al-Fatihah
  const ayahRange = ref<[number, number]>([1, 7]);
  const currentAyahIndex = ref(0); // Index within the ayah range
  const currentWordIndex = ref(-1); // -1 means not started

  // Session timing
  const startTime = ref<Date | null>(null);
  const endTime = ref<Date | null>(null);

  // Word highlights: Map<globalWordIndex, WordHighlight>
  // globalWordIndex = ayahIndex * 1000 + wordIndex (to create unique keys)
  const highlights = ref<Map<number, WordHighlight>>(new Map());

  // Statistics
  const totalWords = ref(0);
  const processedWords = ref(0);

  /**
   * Create a unique key for a word position
   */
  function getWordKey(ayahIndex: number, wordIndex: number): number {
    return ayahIndex * 1000 + wordIndex;
  }

  /**
   * Start a new recitation session
   */
  function startSession(surahNumber: number, range?: [number, number]) {
    // Reset state
    highlights.value.clear();
    currentSurahNumber.value = surahNumber;
    ayahRange.value = range ?? [1, 7]; // Default to full surah for short ones
    currentAyahIndex.value = 0;
    currentWordIndex.value = -1;
    totalWords.value = 0;
    processedWords.value = 0;

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
        // Keep the highlight status from AI feedback, or default to idle
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
   * Update highlights based on AI feedback
   */
  function updateHighlights(feedback: TajweedTokenFeedback[]) {
    for (const token of feedback) {
      const key = getWordKey(currentAyahIndex.value, token.wordIndex);

      // Determine status based on errors
      let status: HighlightStatus = "correct";
      if (token.errors.length > 0) {
        const hasMajor = token.errors.some((e) => e.severity === "major");
        status = hasMajor ? "error" : "warning";
      }

      highlights.value.set(key, {
        status,
        rules: token.rulesApplied,
        message:
          token.errors.length > 0
            ? token.errors.map((e) => e.message).join("; ")
            : undefined,
      });

      processedWords.value++;
    }
  }

  /**
   * Set a specific word's highlight status (for demo/testing)
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

  /**
   * Move to next ayah
   */
  function nextAyah(): boolean {
    const [start, end] = ayahRange.value;
    const maxIndex = end - start;

    if (currentAyahIndex.value < maxIndex) {
      currentAyahIndex.value++;
      currentWordIndex.value = -1;
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

  /**
   * Generate session summary
   */
  function generateSummary(): SessionSummary {
    let correctCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    const ruleBreakdown: Record<
      TajweedRule,
      { correct: number; errors: number }
    > = {} as any;

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
      }

      // Track rule breakdown
      if (highlight.rules) {
        for (const rule of highlight.rules) {
          if (!ruleBreakdown[rule]) {
            ruleBreakdown[rule] = { correct: 0, errors: 0 };
          }
          if (highlight.status === "correct") {
            ruleBreakdown[rule].correct++;
          } else {
            ruleBreakdown[rule].errors++;
          }
        }
      }
    });

    const total = correctCount + warningCount + errorCount;
    const overallScore =
      total > 0 ? Math.round((correctCount / total) * 100) : 0;

    const duration =
      endTime.value && startTime.value
        ? endTime.value.getTime() - startTime.value.getTime()
        : 0;

    return {
      id: crypto.randomUUID(),
      timestamp: startTime.value ?? new Date(),
      surahNumber: currentSurahNumber.value,
      surahName: "", // Will be filled by caller
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
  }

  /**
   * Compute real-time tajweed score (0-1) based on highlight status
   * Used for visual feedback in ThreeSceneCanvas
   */
  const tajweedScore = computed(() => {
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
    const score = (correct * 1 + warning * 0.5 + error * 0) / total;
    return score;
  });

  return {
    // State
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
    tajweedScore, // Real-time correctness ratio (0-1)

    // Methods
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    setCurrentWord,
    updateHighlights,
    setWordHighlight,
    getWordHighlight,
    nextAyah,
    prevAyah,
    resetSession,
  };
}

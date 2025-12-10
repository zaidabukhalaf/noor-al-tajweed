/**
 * Structured Tajweed Analysis API
 *
 * POST /api/tajweed/analyze-structured
 *
 * This endpoint returns a full TajweedAnalysisResponse with:
 * - Word alignments
 * - Rule instances
 * - Per-word feedback
 * - Summary statistics
 *
 * Currently uses realistic mock logic. To integrate with a real AI service,
 * replace the mock logic with:
 *
 * ```ts
 * const aiResponse = await $fetch<TajweedAnalysisResponse>(
 *   process.env.TAJWEED_AI_URL + '/analyze',
 *   { method: 'POST', body: { surahNumber, ayahNumber, ayahText, audioData } }
 * );
 * return aiResponse;
 * ```
 *
 * @module api/tajweed/analyze-structured
 */

import type {
  TajweedAnalyzeRequest,
  TajweedAnalysisResponse,
  RecognizedToken,
  QuranWordAlignment,
  TajweedRuleInstance,
  TajweedRuleId,
  TajweedWordFeedback,
  TajweedStatus,
  TajweedIssue,
  TajweedAnalysisSummary,
  MatchQuality,
} from "~/types/tajweed";

// ==========================================
// Text Processing Utilities
// ==========================================

/**
 * Tokenize Arabic text into words.
 * Preserves original word forms for alignment.
 */
function tokenizeAyahText(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0);
}

/**
 * Remove tashkeel (diacritics) from Arabic text for ASR simulation.
 */
function removeTashkeel(text: string): string {
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, "");
}

/**
 * Simple deterministic "random" based on seed.
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ==========================================
// Rule Detection (Pattern-Based Mock)
// ==========================================

/**
 * Detect tajweed rules based on text patterns.
 */
function detectRulesInWords(
  words: string[],
  seed: number
): TajweedRuleInstance[] {
  const rules: TajweedRuleInstance[] = [];
  const random = seededRandom(seed);

  for (let i = 0; i < words.length; i++) {
    const word = words[i] ?? "";
    const nextWord = words[i + 1] ?? "";

    // Detect noon sakinah / tanween rules
    const hasNoonSakinah = /ن[ْ]/.test(word) || /[ًٌٍ]/.test(word);

    // Madd detection
    if (/[اوي]/.test(word) && random() > 0.6) {
      const maddType = random() > 0.5 ? "madd_tabii" : "madd_muttasil";
      rules.push({
        id: maddType as TajweedRuleId,
        displayNameAr: maddType === "madd_tabii" ? "مد طبيعي" : "مد متصل",
        displayNameEn:
          maddType === "madd_tabii" ? "Natural Madd" : "Connected Madd",
        descriptionAr:
          maddType === "madd_tabii"
            ? "المد الأصلي بمقدار حركتين"
            : "المد الواجب المتصل",
        descriptionEn:
          maddType === "madd_tabii"
            ? "Natural elongation of 2 counts"
            : "Connected elongation",
        affectedWordIndices: [i],
        expectedMinDurationMs: maddType === "madd_tabii" ? 400 : 800,
        expectedMaxDurationMs: maddType === "madd_tabii" ? 600 : 1200,
      });
    }

    // Ghunnah detection
    if (/[نم]ّ/.test(word) && random() > 0.5) {
      rules.push({
        id: "ghunnah",
        displayNameAr: "غنة",
        displayNameEn: "Ghunnah",
        descriptionAr: "إظهار الصوت من الخيشوم",
        descriptionEn: "Nasalization with noon/meem mushaddad",
        affectedWordIndices: [i],
        expectedMinDurationMs: 400,
        expectedMaxDurationMs: 600,
      });
    }

    // Idgham detection
    if (hasNoonSakinah && nextWord && /^[يرملون]/.test(nextWord)) {
      const withGhunnah = /^[ينمو]/.test(nextWord);
      rules.push({
        id: withGhunnah ? "idgham_bi_ghunnah" : "idgham_bila_ghunnah",
        displayNameAr: withGhunnah ? "إدغام بغنة" : "إدغام بلا غنة",
        displayNameEn: withGhunnah
          ? "Idgham with Ghunnah"
          : "Idgham without Ghunnah",
        descriptionAr: withGhunnah
          ? "إدغام مع غنة في حروف ينمو"
          : "إدغام بدون غنة في اللام والراء",
        descriptionEn: withGhunnah
          ? "Merging with nasalization"
          : "Merging without nasalization",
        affectedWordIndices: [i, i + 1],
      });
    }

    // Ikhfa detection
    const ikhfaLetters = "تثجدذزسشصضطظفقك";
    if (
      hasNoonSakinah &&
      nextWord &&
      ikhfaLetters.includes(nextWord.charAt(0))
    ) {
      rules.push({
        id: "ikhfa",
        displayNameAr: "إخفاء",
        displayNameEn: "Ikhfa",
        descriptionAr: "إخفاء النون الساكنة",
        descriptionEn: "Concealing noon sakinah",
        affectedWordIndices: [i, i + 1],
      });
    }

    // Qalqalah detection
    if (/[قطبجد][ْ]|[قطبجد]$/.test(word) && random() > 0.4) {
      rules.push({
        id: "qalqalah",
        displayNameAr: "قلقلة",
        displayNameEn: "Qalqalah",
        descriptionAr: "اهتزاز حرف القلقلة",
        descriptionEn: "Echo of qalqalah letter",
        affectedWordIndices: [i],
      });
    }
  }

  return rules;
}

// ==========================================
// Mock Data Generation
// ==========================================

/**
 * Generate mock recognized tokens (simulated ASR output).
 */
function generateMockRecognizedTokens(
  words: string[],
  seed: number
): RecognizedToken[] {
  const random = seededRandom(seed);
  const tokens: RecognizedToken[] = [];
  let currentTime = 200;

  for (let i = 0; i < words.length; i++) {
    const word = words[i] ?? "";
    const baseDuration = 700 + Math.floor(random() * 400);
    const gap = 100 + Math.floor(random() * 150);

    const startTimeMs = currentTime + gap;
    const endTimeMs = startTimeMs + baseDuration;

    let recognizedText = removeTashkeel(word);

    // Simulate 5% recognition errors
    if (random() < 0.05 && recognizedText.length > 1) {
      recognizedText = recognizedText.substring(0, recognizedText.length - 1);
    }

    tokens.push({
      text: recognizedText,
      startTimeMs,
      endTimeMs,
      confidence: 0.85 + random() * 0.15,
    });

    currentTime = endTimeMs;
  }

  return tokens;
}

/**
 * Generate word alignments between Qur'an text and recognized tokens.
 */
function generateAlignments(
  words: string[],
  tokens: RecognizedToken[],
  seed: number
): QuranWordAlignment[] {
  const random = seededRandom(seed + 100);
  const alignments: QuranWordAlignment[] = [];

  for (let i = 0; i < words.length; i++) {
    const quranWord = words[i] ?? "";
    const token = tokens[i];
    if (!token) continue;

    let matchQuality: MatchQuality = "exact";
    const expectedNormalized = removeTashkeel(quranWord);

    if (token.text === expectedNormalized) {
      matchQuality = "exact";
    } else if (
      token.text.length >= expectedNormalized.length * 0.7 &&
      expectedNormalized.includes(token.text.substring(0, 2))
    ) {
      matchQuality = "partial";
    } else if (random() < 0.03) {
      matchQuality = "mismatch";
    }

    alignments.push({
      quranWordIndex: i,
      quranWordText: quranWord,
      recognizedText: token.text,
      startTimeMs: token.startTimeMs,
      endTimeMs: token.endTimeMs,
      matchQuality,
      confidence: token.confidence * (matchQuality === "exact" ? 1 : 0.8),
    });
  }

  return alignments;
}

/**
 * Generate per-word feedback based on rules and alignments.
 */
function generateFeedback(
  words: string[],
  alignments: QuranWordAlignment[],
  rules: TajweedRuleInstance[],
  seed: number
): TajweedWordFeedback[] {
  const random = seededRandom(seed + 200);
  const feedback: TajweedWordFeedback[] = [];

  // Create a map of word indices to their applicable rules
  const wordRules = new Map<number, TajweedRuleInstance[]>();
  for (const rule of rules) {
    for (const idx of rule.affectedWordIndices) {
      if (!wordRules.has(idx)) {
        wordRules.set(idx, []);
      }
      wordRules.get(idx)!.push(rule);
    }
  }

  for (let i = 0; i < words.length; i++) {
    const alignment = alignments[i];
    if (!alignment) continue;

    const applicableRules = wordRules.get(i) || [];

    let status: TajweedStatus = "correct";
    const issues: TajweedIssue[] = [];
    const rulesApplied: TajweedRuleId[] = [];

    // Check alignment quality
    if (alignment.matchQuality === "mismatch") {
      status = "error";
      issues.push({
        type: "makhraj",
        messageAr: "الكلمة غير واضحة، حاول مرة أخرى",
        messageEn: "Word unclear, please try again",
        severity: "major",
      });
    } else if (alignment.matchQuality === "partial") {
      status = "warning";
      issues.push({
        type: "makhraj",
        messageAr: "تحتاج إلى توضيح المخرج",
        messageEn: "Articulation needs improvement",
        severity: "minor",
      });
    }

    // Evaluate each applicable rule
    for (const rule of applicableRules) {
      const ruleRandom = random();

      // Probabilities: 50% correct, 30% warning, 20% error
      // This creates more realistic demo feedback
      if (ruleRandom < 0.5) {
        rulesApplied.push(rule.id);
      } else if (ruleRandom < 0.8) {
        if (status === "correct") status = "warning";
        issues.push({
          type: rule.id.startsWith("madd")
            ? "madd"
            : rule.id.includes("ghunnah")
            ? "ghunnah"
            : "rule_violated",
          ruleId: rule.id,
          messageAr: generateArabicMessage(rule.id, "warning"),
          messageEn: generateEnglishMessage(rule.id, "warning"),
          severity: "minor",
        });
      } else {
        status = "error";
        issues.push({
          type: rule.id.startsWith("madd")
            ? "madd"
            : rule.id.includes("ghunnah")
            ? "ghunnah"
            : "rule_violated",
          ruleId: rule.id,
          messageAr: generateArabicMessage(rule.id, "error"),
          messageEn: generateEnglishMessage(rule.id, "error"),
          severity: "major",
        });
      }
    }

    feedback.push({
      wordIndex: i,
      status,
      issues,
      rulesApplied: rulesApplied.length > 0 ? rulesApplied : undefined,
    });
  }

  return feedback;
}

/**
 * Generate encouraging Arabic message for an issue.
 */
function generateArabicMessage(
  ruleId: TajweedRuleId,
  severity: "warning" | "error"
): string {
  const defaultMsg = { warning: "يحتاج تحسين بسيط", error: "يحتاج مراجعة" };
  const messages: Record<string, { warning: string; error: string }> = {
    ghunnah: {
      warning: "الغنة قصيرة قليلاً، حاول إطالتها",
      error: "الغنة قصيرة جداً، يجب أن تكون حركتين",
    },
    madd_tabii: {
      warning: "المد الطبيعي يحتاج تحسين بسيط",
      error: "المد أقصر من حركتين",
    },
    madd_muttasil: {
      warning: "المد المتصل يحتاج إطالة أكثر",
      error: "المد المتصل قصير جداً",
    },
    idgham_bi_ghunnah: {
      warning: "الإدغام بغنة يحتاج وضوحاً أكثر",
      error: "الإدغام غير واضح",
    },
    idgham_bila_ghunnah: {
      warning: "الإدغام يحتاج تحسين",
      error: "الإدغام غير صحيح",
    },
    ikhfa: {
      warning: "الإخفاء يحتاج تحسين بسيط",
      error: "الإخفاء غير واضح",
    },
    qalqalah: {
      warning: "القلقلة خفيفة قليلاً",
      error: "القلقلة غير واضحة",
    },
  };

  const msg = messages[ruleId] ?? defaultMsg;
  return severity === "warning" ? msg.warning : msg.error;
}

/**
 * Generate encouraging English message for an issue.
 */
function generateEnglishMessage(
  ruleId: TajweedRuleId,
  severity: "warning" | "error"
): string {
  const defaultMsg = {
    warning: "Needs slight improvement",
    error: "Needs review",
  };
  const messages: Record<string, { warning: string; error: string }> = {
    ghunnah: {
      warning: "Ghunnah slightly short, try to extend it",
      error: "Ghunnah too short, should be 2 counts",
    },
    madd_tabii: {
      warning: "Natural madd needs slight improvement",
      error: "Madd shorter than 2 counts",
    },
    madd_muttasil: {
      warning: "Connected madd needs more elongation",
      error: "Connected madd too short",
    },
    idgham_bi_ghunnah: {
      warning: "Idgham with ghunnah needs more clarity",
      error: "Idgham unclear",
    },
    qalqalah: {
      warning: "Qalqalah slightly weak",
      error: "Qalqalah unclear",
    },
  };

  const msg = messages[ruleId] ?? defaultMsg;
  return severity === "warning" ? msg.warning : msg.error;
}

/**
 * Compute summary statistics from feedback.
 */
function computeSummary(
  feedback: TajweedWordFeedback[],
  alignments: QuranWordAlignment[]
): TajweedAnalysisSummary {
  let correctCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  const ruleBreakdown: Record<
    TajweedRuleId,
    { correct: number; issues: number }
  > = {} as Record<TajweedRuleId, { correct: number; issues: number }>;

  for (const fb of feedback) {
    switch (fb.status) {
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

    if (fb.rulesApplied) {
      for (const ruleId of fb.rulesApplied) {
        if (!ruleBreakdown[ruleId]) {
          ruleBreakdown[ruleId] = { correct: 0, issues: 0 };
        }
        ruleBreakdown[ruleId].correct++;
      }
    }

    for (const issue of fb.issues) {
      if (issue.ruleId) {
        if (!ruleBreakdown[issue.ruleId]) {
          ruleBreakdown[issue.ruleId] = { correct: 0, issues: 0 };
        }
        ruleBreakdown[issue.ruleId].issues++;
      }
    }
  }

  const totalWords = feedback.length;
  const lastAlignment = alignments[alignments.length - 1];
  const totalDurationMs = lastAlignment ? lastAlignment.endTimeMs : 0;

  // Score formula: correct=100%, warning=50%, error=0%
  // This ensures errors actually reduce the score
  const overallScore =
    totalWords > 0
      ? Math.round(
          (correctCount * 100 + warningCount * 50 + errorCount * 0) / totalWords
        )
      : 0;

  return {
    overallScore,
    correctCount,
    warningCount,
    errorCount,
    totalWords,
    totalDurationMs,
    ruleBreakdown:
      Object.keys(ruleBreakdown).length > 0 ? ruleBreakdown : undefined,
  };
}

// ==========================================
// Main Handler
// ==========================================

export default defineEventHandler(async (event) => {
  const body = await readBody<TajweedAnalyzeRequest>(event);

  if (!body || !body.ayahText) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request: ayahText is required",
    });
  }

  const { surahNumber = 1, ayahNumber = 1, ayahText } = body;
  const seed = surahNumber * 1000 + ayahNumber;

  // Simulate processing delay
  await new Promise((resolve) =>
    setTimeout(resolve, 100 + Math.random() * 200)
  );

  // Tokenize the ayah
  const words = tokenizeAyahText(ayahText);

  if (words.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request: ayahText contains no words",
    });
  }

  // Generate mock data
  const recognizedTokens = generateMockRecognizedTokens(words, seed);
  const alignments = generateAlignments(words, recognizedTokens, seed);
  const rules = detectRulesInWords(words, seed);
  const feedback = generateFeedback(words, alignments, rules, seed);
  const summary = computeSummary(feedback, alignments);

  const response: TajweedAnalysisResponse = {
    surahNumber,
    ayahNumber,
    ayahText,
    alignments,
    rules,
    feedback,
    summary,
    analyzedAt: new Date().toISOString(),
    engineVersion: "mock-1.0.0",
  };

  return response;
});

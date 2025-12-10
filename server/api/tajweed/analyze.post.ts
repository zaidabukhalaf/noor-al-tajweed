/**
 * Mock Tajwīd Analysis API
 *
 * POST /api/tajweed/analyze
 *
 * This endpoint simulates tajwīd analysis by returning mock timing data.
 * In Phase 4, this will be replaced with real AI integration.
 *
 * Request body:
 * - surahNumber: number
 * - ayahNumber: number
 * - wordCount: number
 *
 * Response:
 * - timings: MockTajweedTiming[]
 */

interface MockTajweedTiming {
  wordIndex: number;
  startTimeMs: number;
  endTimeMs: number;
  status: "correct" | "warning" | "error";
  rulesApplied: string[];
  message?: string;
}

interface AnalyzeRequest {
  surahNumber: number;
  ayahNumber: number;
  wordCount: number;
}

/**
 * Generate mock timing data for an ayah
 *
 * Rules for mock feedback:
 * - Most words are correct (70%)
 * - Every 4th word has a warning (20%)
 * - Every 7th word has an error (10%)
 * - Timing: ~800ms per word with slight variation
 */
function generateMockTimings(
  wordCount: number,
  surahNumber: number
): MockTajweedTiming[] {
  const timings: MockTajweedTiming[] = [];
  let currentTime = 0;

  // Use surah number as seed for consistent results
  const seed = surahNumber * 7;

  for (let i = 0; i < wordCount; i++) {
    // Duration varies between 700-1000ms
    const baseDuration = 800;
    const variation = Math.sin((i + seed) * 0.5) * 150;
    const duration = Math.round(baseDuration + variation);

    // Small gap between words (100-200ms)
    const gap = 100 + Math.round(Math.abs(Math.sin(i * 0.7)) * 100);

    const startTimeMs = currentTime + gap;
    const endTimeMs = startTimeMs + duration;

    // Determine status
    let status: "correct" | "warning" | "error" = "correct";
    let rulesApplied: string[] = [];
    let message: string | undefined;

    // Pseudo-random based on word index and surah
    const statusSeed = (i + seed) % 10;

    if (statusSeed === 7) {
      // Error on ~10% of words
      status = "error";
      rulesApplied = ["ghunnah"];
      message = "الغنة قصيرة جداً";
    } else if (statusSeed === 3 || statusSeed === 6) {
      // Warning on ~20% of words
      status = "warning";
      rulesApplied = ["madd_tabii"];
      message = "المد يحتاج تحسين";
    } else {
      // Correct on ~70% of words
      status = "correct";

      // Add random rules that were correctly applied
      if (i % 3 === 0) rulesApplied.push("ghunnah");
      if (i % 4 === 0) rulesApplied.push("madd_tabii");
      if (i % 5 === 0) rulesApplied.push("idgham");
    }

    timings.push({
      wordIndex: i,
      startTimeMs,
      endTimeMs,
      status,
      rulesApplied,
      message,
    });

    currentTime = endTimeMs;
  }

  return timings;
}

export default defineEventHandler(async (event) => {
  // Parse request body
  const body = await readBody<AnalyzeRequest>(event);

  if (!body || typeof body.wordCount !== "number") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request: wordCount is required",
    });
  }

  const { surahNumber = 1, ayahNumber = 1, wordCount } = body;

  // Simulate processing delay (50-150ms)
  await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100));

  // Generate mock timings
  const timings = generateMockTimings(wordCount, surahNumber);

  // Calculate summary stats
  const correctCount = timings.filter((t) => t.status === "correct").length;
  const warningCount = timings.filter((t) => t.status === "warning").length;
  const errorCount = timings.filter((t) => t.status === "error").length;

  return {
    success: true,
    surahNumber,
    ayahNumber,
    wordCount,
    timings,
    summary: {
      correctCount,
      warningCount,
      errorCount,
      totalDurationMs:
        timings.length > 0 ? timings[timings.length - 1]?.endTimeMs ?? 0 : 0,
    },
  };
});

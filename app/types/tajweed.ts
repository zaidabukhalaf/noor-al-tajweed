/**
 * Tajweed Analysis Types
 *
 * Production-quality type definitions for the tajweed analysis pipeline.
 * This is the single source of truth for all tajweed-related types.
 *
 * These types define the contract between:
 * - Frontend (Nuxt/Vue)
 * - Backend API (Nuxt Server Routes)
 * - Future AI Service (Python microservice)
 *
 * @module types/tajweed
 */

// ==========================================
// Core Status Types
// ==========================================

/**
 * Overall feedback status for a word
 */
export type TajweedStatus = "correct" | "warning" | "error";

/**
 * Quality of alignment between recognized speech and Qur'an text
 */
export type MatchQuality = "exact" | "partial" | "mismatch";

/**
 * Category of tajweed issue
 */
export type TajweedIssueType =
  | "makhraj" // Pronunciation point error
  | "madd" // Elongation error
  | "ghunnah" // Nasalization error
  | "rule_violated" // General rule violation
  | "timing"; // Timing/duration error

/**
 * Severity of a tajweed issue
 */
export type TajweedIssueSeverity = "minor" | "major";

// ==========================================
// ASR Recognition Types
// ==========================================

/**
 * A token recognized by the ASR (Automatic Speech Recognition) system.
 * Represents what the AI "heard" from the reciter's voice.
 */
export interface RecognizedToken {
  /** ASR-recognized text (typically without tashkeel) */
  text: string;
  /** Start time in milliseconds from recording start */
  startTimeMs: number;
  /** End time in milliseconds from recording start */
  endTimeMs: number;
  /** ASR confidence score (0–1) */
  confidence: number;
}

// ==========================================
// Alignment Types
// ==========================================

/**
 * Alignment between a Qur'an word and its recognized speech.
 * Maps the original Uthmani word to what was actually recited.
 */
export interface QuranWordAlignment {
  /** Index of the word in the ayah (0-based) */
  quranWordIndex: number;
  /** The original Uthmani word (with full tashkeel) */
  quranWordText: string;
  /** ASR-recognized text (normalized, may lack tashkeel) */
  recognizedText: string;
  /** Start time in milliseconds */
  startTimeMs: number;
  /** End time in milliseconds */
  endTimeMs: number;
  /** Quality of the match between expected and recognized */
  matchQuality: MatchQuality;
  /** Alignment confidence (0–1) */
  confidence: number;
}

// ==========================================
// Tajweed Rule Types
// ==========================================

/**
 * Known tajweed rule identifiers.
 * These map to specific tajweed rules that can be detected and evaluated.
 */
export type TajweedRuleId =
  // Ghunnah (Nasalization)
  | "ghunnah"
  // Madd (Elongation) variants
  | "madd_tabii"
  | "madd_lazim"
  | "madd_muttasil"
  | "madd_munfasil"
  | "madd_arid"
  | "madd_lin"
  // Idgham (Assimilation)
  | "idgham_bi_ghunnah"
  | "idgham_bila_ghunnah"
  // Ikhfa (Concealment)
  | "ikhfa"
  | "ikhfa_shafawi"
  // Iqlab (Conversion)
  | "iqlab"
  // Izhar (Clarity)
  | "izhar"
  | "izhar_shafawi"
  // Qalqalah (Echo)
  | "qalqalah"
  // Makhraj (Articulation Point)
  | "makhraj";

/**
 * Metadata for a tajweed rule that applies to one or more words.
 */
export interface TajweedRuleInstance {
  /** Unique rule identifier */
  id: TajweedRuleId;
  /** Arabic display name (e.g., "إدغام بغنة") */
  displayNameAr: string;
  /** English display name (e.g., "Idgham with Ghunnah") */
  displayNameEn: string;
  /** Arabic description of the rule */
  descriptionAr: string;
  /** English description of the rule */
  descriptionEn: string;
  /** Indices of words affected by this rule (0-based) */
  affectedWordIndices: number[];
  /** For madd/ghunnah: minimum expected duration in ms */
  expectedMinDurationMs?: number;
  /** For madd/ghunnah: maximum expected duration in ms */
  expectedMaxDurationMs?: number;
}

// ==========================================
// Feedback Types
// ==========================================

/**
 * A specific issue detected in the recitation.
 */
export interface TajweedIssue {
  /** Category of the issue */
  type: TajweedIssueType;
  /** Reference to the rule that was violated (if applicable) */
  ruleId?: TajweedRuleId;
  /** User-facing message in Arabic */
  messageAr: string;
  /** User-facing message in English */
  messageEn: string;
  /** Severity of the issue */
  severity: TajweedIssueSeverity;
}

/**
 * Feedback for a single word in the ayah.
 */
export interface TajweedWordFeedback {
  /** Word index in the ayah (0-based) */
  wordIndex: number;
  /** Overall status for this word */
  status: TajweedStatus;
  /** List of issues detected (empty if correct) */
  issues: TajweedIssue[];
  /** Rules that were correctly applied (for positive feedback) */
  rulesApplied?: TajweedRuleId[];
}

// ==========================================
// Summary Types
// ==========================================

/**
 * Summary statistics for a tajweed analysis.
 */
export interface TajweedAnalysisSummary {
  /** Overall score (0–100) */
  overallScore: number;
  /** Number of words with "correct" status */
  correctCount: number;
  /** Number of words with "warning" status */
  warningCount: number;
  /** Number of words with "error" status */
  errorCount: number;
  /** Total number of words analyzed */
  totalWords: number;
  /** Total duration of the analyzed audio in ms */
  totalDurationMs: number;
  /** Breakdown by rule */
  ruleBreakdown?: Record<TajweedRuleId, { correct: number; issues: number }>;
}

// ==========================================
// API Request/Response Types
// ==========================================

/**
 * Request body for the structured tajweed analysis API.
 */
export interface TajweedAnalyzeRequest {
  /** Surah number (1-114) */
  surahNumber: number;
  /** Ayah number within the surah (1-based) */
  ayahNumber: number;
  /** Full Uthmani text of the ayah (with tashkeel) */
  ayahText: string;
  /** Optional: Audio data (Base64 or ArrayBuffer) for real AI analysis */
  audioData?: string;
  /** Optional: Audio format (e.g., "webm", "wav") */
  audioFormat?: string;
}

/**
 * Full response from the structured tajweed analysis API.
 *
 * This is the contract that the Python AI service must also return.
 * The mock implementation returns this exact structure.
 */
export interface TajweedAnalysisResponse {
  /** Surah number analyzed */
  surahNumber: number;
  /** Ayah number analyzed */
  ayahNumber: number;
  /** Full Uthmani ayah text (echoed for verification) */
  ayahText: string;
  /** Word-by-word alignment between Qur'an and recognized speech */
  alignments: QuranWordAlignment[];
  /** Tajweed rules detected in this ayah */
  rules: TajweedRuleInstance[];
  /** Per-word feedback */
  feedback: TajweedWordFeedback[];
  /** Summary statistics */
  summary: TajweedAnalysisSummary;
  /** Timestamp of the analysis (ISO 8601) */
  analyzedAt: string;
  /** Version of the analysis engine */
  engineVersion: string;
}

// ==========================================
// Rule Metadata (Static Reference Data)
// ==========================================

/**
 * Static metadata for all known tajweed rules.
 * Used for UI display and tooltip generation.
 */
export const TAJWEED_RULE_META: Record<
  TajweedRuleId,
  {
    nameAr: string;
    nameEn: string;
    descriptionAr: string;
    descriptionEn: string;
  }
> = {
  ghunnah: {
    nameAr: "غنة",
    nameEn: "Ghunnah",
    descriptionAr: "إظهار الصوت من الخيشوم مع النون أو الميم المشددة",
    descriptionEn: "Nasalization with noon or meem mushaddad",
  },
  madd_tabii: {
    nameAr: "مد طبيعي",
    nameEn: "Natural Madd",
    descriptionAr: "المد الأصلي بمقدار حركتين",
    descriptionEn: "Natural elongation of 2 counts",
  },
  madd_lazim: {
    nameAr: "مد لازم",
    nameEn: "Obligatory Madd",
    descriptionAr: "المد اللازم بمقدار ست حركات",
    descriptionEn: "Obligatory elongation of 6 counts",
  },
  madd_muttasil: {
    nameAr: "مد متصل",
    nameEn: "Connected Madd",
    descriptionAr: "المد الواجب المتصل بمقدار 4-5 حركات",
    descriptionEn: "Connected elongation of 4-5 counts",
  },
  madd_munfasil: {
    nameAr: "مد منفصل",
    nameEn: "Separated Madd",
    descriptionAr: "المد الجائز المنفصل بمقدار 4-5 حركات",
    descriptionEn: "Separated elongation of 4-5 counts",
  },
  madd_arid: {
    nameAr: "مد عارض للسكون",
    nameEn: "Temporary Madd",
    descriptionAr: "المد العارض للسكون في نهاية الآية",
    descriptionEn: "Temporary elongation at verse end",
  },
  madd_lin: {
    nameAr: "مد لين",
    nameEn: "Soft Madd",
    descriptionAr: "المد اللين مع الواو أو الياء الساكنة",
    descriptionEn: "Soft elongation with waw or ya",
  },
  idgham_bi_ghunnah: {
    nameAr: "إدغام بغنة",
    nameEn: "Idgham with Ghunnah",
    descriptionAr: "إدغام النون الساكنة في حروف يرملون مع غنة",
    descriptionEn: "Merging noon sakinah with ghunnah",
  },
  idgham_bila_ghunnah: {
    nameAr: "إدغام بلا غنة",
    nameEn: "Idgham without Ghunnah",
    descriptionAr: "إدغام النون الساكنة في اللام والراء بدون غنة",
    descriptionEn: "Merging noon sakinah without ghunnah",
  },
  ikhfa: {
    nameAr: "إخفاء",
    nameEn: "Ikhfa",
    descriptionAr: "إخفاء النون الساكنة عند حروف الإخفاء",
    descriptionEn: "Concealing noon sakinah",
  },
  ikhfa_shafawi: {
    nameAr: "إخفاء شفوي",
    nameEn: "Labial Ikhfa",
    descriptionAr: "إخفاء الميم الساكنة عند الباء",
    descriptionEn: "Concealing meem sakinah before ba",
  },
  iqlab: {
    nameAr: "إقلاب",
    nameEn: "Iqlab",
    descriptionAr: "قلب النون الساكنة ميماً عند الباء",
    descriptionEn: "Converting noon to meem before ba",
  },
  izhar: {
    nameAr: "إظهار",
    nameEn: "Izhar",
    descriptionAr: "إظهار النون الساكنة عند حروف الحلق",
    descriptionEn: "Clear pronunciation of noon sakinah",
  },
  izhar_shafawi: {
    nameAr: "إظهار شفوي",
    nameEn: "Labial Izhar",
    descriptionAr: "إظهار الميم الساكنة عند غير الباء والميم",
    descriptionEn: "Clear pronunciation of meem sakinah",
  },
  qalqalah: {
    nameAr: "قلقلة",
    nameEn: "Qalqalah",
    descriptionAr: "اهتزاز الحرف الساكن من حروف قطب جد",
    descriptionEn: "Echo/bounce of qutb-jad letters",
  },
  makhraj: {
    nameAr: "مخرج",
    nameEn: "Makhraj",
    descriptionAr: "نقطة خروج الحرف من الفم",
    descriptionEn: "Articulation point of the letter",
  },
};

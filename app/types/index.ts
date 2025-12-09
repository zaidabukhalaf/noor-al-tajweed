// ==========================================
// Qur'an Data Types
// ==========================================

export interface Surah {
  number: number;
  name: string;
  nameArabic: string;
  ayahCount: number;
  ayat: Ayah[];
}

export interface Ayah {
  number: number;
  text: string; // Uthmani text with tashkīl - NEVER modify this
}

export interface WordToken {
  index: number;
  word: string;
  /** The word with its trailing whitespace preserved - use this for display */
  displayText: string;
  startOffset: number;
  endOffset: number;
}

// ==========================================
// Tajwīd Feedback Types
// ==========================================

export type HighlightStatus =
  | "idle"
  | "current"
  | "correct"
  | "warning"
  | "error";

export interface WordHighlight {
  status: HighlightStatus;
  rules?: TajweedRule[];
  message?: string;
}

export type TajweedRule =
  | "ghunnah"
  | "madd_tabii"
  | "madd_lazim"
  | "madd_muttasil"
  | "madd_munfasil"
  | "idgham"
  | "idgham_bi_ghunnah"
  | "idgham_bila_ghunnah"
  | "ikhfa"
  | "iqlab"
  | "izhar"
  | "qalqalah"
  | "makhraj";

export type TajweedErrorType =
  | "makhraj"
  | "ghunnah"
  | "madd"
  | "rule_violation";

export type TajweedSeverity = "minor" | "major";

export interface TajweedError {
  type: TajweedErrorType;
  severity: TajweedSeverity;
  message: string;
  messageAr?: string;
}

export interface TajweedTokenFeedback {
  wordIndex: number;
  startTimeMs: number;
  endTimeMs: number;
  rulesApplied: TajweedRule[];
  errors: TajweedError[];
}

// ==========================================
// Session Types
// ==========================================

export interface SessionSummary {
  id: string;
  timestamp: Date;
  surahNumber: number;
  surahName: string;
  ayahRange: [number, number];
  totalWords: number;
  correctCount: number;
  warningCount: number;
  errorCount: number;
  ruleBreakdown: Record<TajweedRule, { correct: number; errors: number }>;
  overallScore: number; // 0-100
  duration: number; // milliseconds
}

export interface RecitationSession {
  isActive: boolean;
  surahNumber: number;
  ayahRange: [number, number];
  currentAyahIndex: number;
  currentWordIndex: number;
  highlights: Map<number, WordHighlight>;
  startTime: Date | null;
}

// ==========================================
// App Settings Types
// ==========================================

export type ThemeMode = "light" | "dark" | "auto";
export type EffectsIntensity = "off" | "low" | "normal";
export type AppLanguage = "ar" | "en";
export type RecitationMode = "free" | "practice" | "kids";

export interface AppSettings {
  theme: ThemeMode;
  language: AppLanguage;
  fontSize: number; // 16-32
  effectsIntensity: EffectsIntensity;
  kidsMode: boolean;
  showLegend: boolean;
  showCamera: boolean;
}

// ==========================================
// UI Types
// ==========================================

export interface NavigationItem {
  label: string;
  labelAr: string;
  href: string;
  icon: string;
}

export interface ModeOption {
  id: RecitationMode;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  color: string;
}

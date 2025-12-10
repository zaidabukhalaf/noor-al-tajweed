<script setup lang="ts">
/**
 * QuranTextDisplay.vue
 *
 * The heart of the app - displays Qur'anic text with tajwīd highlighting.
 * IMPORTANT: The original text is NEVER modified. All highlighting is done via CSS classes.
 */

import type { WordToken, WordHighlight, HighlightStatus } from "~/types";

interface Props {
  /** The full ayah text in Uthmani script - NEVER MODIFY */
  ayahText: string;
  /** Ayah number for display */
  ayahNumber?: number;
  /** Current ayah index (for highlight lookup) */
  ayahIndex?: number;
  /** Map of wordIndex -> highlight state (ReadonlyMap from composable) */
  highlights?: ReadonlyMap<
    number,
    {
      readonly status: HighlightStatus;
      readonly rules?: readonly string[];
      readonly message?: string;
    }
  >;
  /** Font size override */
  fontSize?: number;
  /** Kids mode - larger text */
  kidsMode?: boolean;
  /** Show word tooltips */
  showTooltips?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  ayahNumber: undefined,
  ayahIndex: 0,
  highlights: undefined,
  fontSize: undefined,
  kidsMode: false,
  showTooltips: true,
});

const emit = defineEmits<{
  (e: "wordClick", wordIndex: number, word: string): void;
}>();

const { tokenizeAyah } = useQuranData();
const { settings, t } = useAppSettings();

// Tokenize the ayah text into words
const tokens = computed<WordToken[]>(() => {
  return tokenizeAyah(props.ayahText);
});

// Compute the CSS class for each word based on highlight status
function getWordClass(wordIndex: number): string[] {
  const classes = ["word"];

  if (!props.highlights) return classes;

  // Create the key based on ayahIndex and wordIndex
  const key = props.ayahIndex * 1000 + wordIndex;
  const highlight = props.highlights.get(key);

  if (highlight) {
    switch (highlight.status) {
      case "current":
        classes.push("word--current");
        break;
      case "correct":
        classes.push("word--correct");
        break;
      case "warning":
        classes.push("word--warning");
        break;
      case "error":
        classes.push("word--error");
        break;
    }
  }

  return classes;
}

// Get tooltip text for a word
function getTooltip(wordIndex: number): string | undefined {
  if (!props.showTooltips || !props.highlights) return undefined;

  const key = props.ayahIndex * 1000 + wordIndex;
  const highlight = props.highlights.get(key);

  if (highlight?.message) {
    return highlight.message;
  }

  if (highlight?.rules?.length) {
    return highlight.rules.join(", ");
  }

  return undefined;
}

// Handle word click
function onWordClick(wordIndex: number, word: string) {
  emit("wordClick", wordIndex, word);
}

// Dynamic font size style
const fontSizeStyle = computed(() => {
  if (props.fontSize) {
    return { fontSize: `${props.fontSize}px` };
  }
  return {};
});

// Classes for the container
const containerClasses = computed(() => {
  const classes = ["quran-display"];
  if (props.kidsMode) {
    classes.push("quran-display--kids");
  }
  return classes;
});
</script>

<template>
  <div :class="containerClasses" :style="fontSizeStyle">
    <!-- Ayah Text -->
    <p class="quran-text" dir="rtl">
      <!--
        CRITICAL: We use displayText (word + trailing space) to preserve
        exact spacing from the original ayah text. Combined with white-space: pre-wrap,
        this ensures span-wrapped text is pixel-identical to plain text.
      -->
      <span
        v-for="token in tokens"
        :key="token.index"
        :class="getWordClass(token.index)"
        :title="getTooltip(token.index)"
        :data-word-index="token.index"
        @click="onWordClick(token.index, token.word)"
        >{{ token.displayText }}</span
      >

      <!-- Ayah Number -->
      <span v-if="ayahNumber" class="ayah-number">﴿{{ ayahNumber }}﴾</span>
    </p>
  </div>
</template>

<style scoped>
.quran-display {
  padding: var(--space-6);
  background-color: var(--bg-card);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-color);
  /* CRITICAL: Never clip Arabic glyphs */
  overflow: visible;
}

.quran-display--kids .quran-text {
  font-size: 2.75rem;
  line-height: 2.8;
}

.quran-text {
  font-family: var(--font-quran);
  font-size: var(--text-quran);
  line-height: var(--line-height-quran);
  text-align: center;
  color: var(--text-primary);
  margin: 0;
  /* CRITICAL: Preserve exact whitespace from original text */
  white-space: pre-wrap;
  /* CRITICAL: Never clip Arabic glyphs */
  overflow: visible;
}

/*
 * Word styling - SAFE for Arabic glyphs
 * 
 * CRITICAL: These styles must NOT change the visual position or shape of letters.
 * The span is purely for applying color/effects, not for layout.
 */
.word {
  display: inline;
  /* NO margin, NO padding - preserve exact original spacing */
  /* Smooth transitions for color only */
  transition: color var(--transition-fast), text-shadow var(--transition-fast);
  cursor: default;
  /* NO position:relative, NO overflow:hidden, NO border-radius */
}

.word:hover {
  /* Very subtle glow on hover - no layout change */
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.08);
}

/* Current word - use text-shadow glow instead of box-shadow */
.word--current {
  color: var(--color-primary);
  text-shadow: 0 0 8px rgba(30, 58, 95, 0.5), 0 0 16px rgba(30, 58, 95, 0.3),
    0 0 24px rgba(30, 58, 95, 0.15);
  animation: pulse-glow 1.5s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    text-shadow: 0 0 8px rgba(30, 58, 95, 0.5), 0 0 16px rgba(30, 58, 95, 0.3),
      0 0 24px rgba(30, 58, 95, 0.15);
  }
  50% {
    text-shadow: 0 0 12px rgba(30, 58, 95, 0.6), 0 0 24px rgba(30, 58, 95, 0.4),
      0 0 36px rgba(30, 58, 95, 0.2);
  }
}

/* Correct - green color */
.word--correct {
  color: var(--highlight-correct);
}

/* Warning - yellow underline with large offset */
.word--warning {
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-color: var(--highlight-warning);
  text-underline-offset: 10px;
  text-decoration-thickness: 2px;
}

/* Error - red underline with large offset */
.word--error {
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-color: var(--highlight-error);
  text-underline-offset: 10px;
  text-decoration-thickness: 2px;
}

/* Ayah Number */
.ayah-number {
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--color-secondary);
  margin-inline-start: var(--space-3);
  vertical-align: middle;
}

/* Responsive */
@media (max-width: 768px) {
  .quran-display {
    padding: var(--space-4);
  }

  .quran-text {
    font-size: 1.5rem;
    line-height: 2.2;
  }

  .word {
    margin: 0 0.1em;
  }
}
</style>

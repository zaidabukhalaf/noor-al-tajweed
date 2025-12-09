<script setup lang="ts">
/**
 * Test Page - Qur'an Font Rendering Test
 *
 * This page tests the base Qur'an font rendering to verify that:
 * 1. Plain text renders correctly
 * 2. Text wrapped in spans is PIXEL-IDENTICAL to plain text
 * 3. Highlight styles don't change letter shapes or positions
 */

const { t, settings } = useAppSettings();
const { tokenizeAyah } = useQuranData();

// Test ayah - using the first ayah of Al-Fatihah that has the problem letters
const testAyah = "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ";

// Tokenize for comparison
const tokens = computed(() => tokenizeAyah(testAyah));

// Letters to check specifically
const problemLetters = "ه ب ي ن ت ث";
</script>

<template>
  <div class="test-page container">
    <h1 class="page-title">اختبار خط القرآن</h1>
    <p class="subtitle">Qur'an Font Rendering Test - Pixel-Identical Check</p>

    <!-- Test 1: Plain text (REFERENCE) -->
    <section class="test-section">
      <h2>1. Plain Text (Reference - No Wrapper)</h2>
      <p class="test-desc">
        This is the reference. All other sections must look identical.
      </p>
      <div class="test-box">
        <p class="quran-render">{{ testAyah }}</p>
      </div>
    </section>

    <!-- Test 2: With word spans (NO styles) -->
    <section class="test-section">
      <h2>2. With Word Spans (Using displayText - No Highlight Styles)</h2>
      <p class="test-desc">Should be pixel-identical to section 1.</p>
      <div class="test-box">
        <p class="quran-render">
          <span v-for="token in tokens" :key="token.index" class="word-plain">{{
            token.displayText
          }}</span>
        </p>
      </div>
    </section>

    <!-- Test 3: With highlight styles applied -->
    <section class="test-section">
      <h2>3. With Highlight Styles (Current + Correct + Warning)</h2>
      <p class="test-desc">
        Letter shapes and positions should be identical to sections 1-2. Only
        colors/effects differ.
      </p>
      <div class="test-box">
        <p class="quran-render">
          <span
            v-for="token in tokens"
            :key="token.index"
            :class="[
              'word-styled',
              token.index === 0 ? 'word-styled--current' : '',
              token.index === 1 ? 'word-styled--correct' : '',
              token.index === 2 ? 'word-styled--warning' : '',
              token.index === 3 ? 'word-styled--error' : '',
            ]"
            >{{ token.displayText }}</span
          >
        </p>
      </div>
    </section>

    <!-- Side-by-side comparison -->
    <section class="test-section">
      <h2>4. Side-by-Side Comparison</h2>
      <div class="comparison">
        <div class="comparison-item">
          <h3>Plain</h3>
          <div class="test-box small">
            <p class="quran-render small">{{ testAyah }}</p>
          </div>
        </div>
        <div class="comparison-item">
          <h3>With Spans</h3>
          <div class="test-box small">
            <p class="quran-render small">
              <span
                v-for="token in tokens"
                :key="token.index"
                class="word-plain"
                >{{ token.displayText }}</span
              >
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem letters isolated -->
    <section class="test-section">
      <h2>5. Problem Letters (Isolated)</h2>
      <div class="test-box">
        <p class="quran-render large">{{ problemLetters }}</p>
      </div>
    </section>

    <NuxtLink to="/recite" class="btn btn--primary"> العودة للتلاوة </NuxtLink>
  </div>
</template>

<style scoped>
.test-page {
  padding: var(--space-8) var(--space-4);
}

.page-title {
  text-align: center;
  margin-bottom: var(--space-2);
}

.subtitle {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: var(--space-8);
}

.test-section {
  margin-bottom: var(--space-8);
}

.test-section h2 {
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
  color: var(--color-primary);
}

.test-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-3);
}

.test-box {
  background: var(--bg-card);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-color);
  padding: var(--space-6);
}

/* Qur'an rendering - EXACT same as production */
.quran-render {
  font-family: "Amiri Quran", "Scheherazade New", serif;
  font-size: 2rem;
  line-height: 2.4;
  direction: rtl;
  text-align: center;
  color: var(--text-primary);
  margin: 0;
  /* CRITICAL: Preserve exact whitespace */
  white-space: pre-wrap;
  overflow: visible;
}

.quran-render.small {
  font-size: 1.5rem;
}

.quran-render.large {
  font-size: 3rem;
  letter-spacing: 0.5em;
}

/* Word spans - NO STYLING that affects layout */
.word-plain {
  display: inline;
  /* NO margin, NO padding */
}

/* Word spans with highlight styles */
.word-styled {
  display: inline;
  /* NO margin, NO padding - preserve exact spacing */
  transition: color 0.15s ease, text-shadow 0.15s ease;
}

.word-styled--current {
  color: var(--color-primary);
  text-shadow: 0 0 8px rgba(30, 58, 95, 0.5), 0 0 16px rgba(30, 58, 95, 0.3);
}

.word-styled--correct {
  color: var(--highlight-correct);
}

.word-styled--warning {
  text-decoration: underline wavy var(--highlight-warning);
  text-underline-offset: 10px;
  text-decoration-thickness: 2px;
}

.word-styled--error {
  text-decoration: underline wavy var(--highlight-error);
  text-underline-offset: 10px;
  text-decoration-thickness: 2px;
}

/* Comparison layout */
.comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.comparison-item h3 {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-2);
  text-align: center;
}

.test-box.small {
  padding: var(--space-4);
}
</style>

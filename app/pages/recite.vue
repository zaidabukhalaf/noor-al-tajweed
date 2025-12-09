<script setup lang="ts">
/**
 * Recite Page (/recite/page.vue)
 *
 * Main recitation session UI with Phase 2 audio integration.
 * - Captures audio from microphone
 * - Fetches mock timing from /api/tajweed/analyze
 * - Drives word-by-word highlighting in real time
 */

import type { SessionSummary, Surah, Ayah, HighlightStatus } from "~/types";
import type { MockTajweedTiming } from "~/composables/useAudioStream";

const route = useRoute();
const router = useRouter();
const { t, settings } = useAppSettings();
const { getSurah, getAyat, surahList, tokenizeAyah } = useQuranData();

// Session composable
const session = useTajweedSession();

// Media devices (mic/camera)
const media = useMediaDevices();

// Audio processing
const audio = useAudioStream();

// Local state
const selectedSurahNumber = ref(Number(route.query.surah) || 1);
const showSummaryModal = ref(false);
const sessionSummary = ref<SessionSummary | null>(null);
const showLegend = ref(true);

// Timing runner reference
let timingRunner: ReturnType<typeof audio.createTimingRunner> | null = null;

// Get current surah data
const currentSurah = computed<Surah | undefined>(() => {
  return getSurah(selectedSurahNumber.value);
});

// Get current ayat
const currentAyat = computed<Ayah[]>(() => {
  return getAyat(selectedSurahNumber.value);
});

// Current ayah based on session
const currentAyah = computed<Ayah | undefined>(() => {
  return currentAyat.value[session.currentAyahIndex.value];
});

// Get word count for current ayah
const currentWordCount = computed(() => {
  if (!currentAyah.value) return 0;
  return tokenizeAyah(currentAyah.value.text).length;
});

// Handle surah selection
function onSurahChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  selectedSurahNumber.value = Number(target.value);

  // Reset session if active
  if (session.isActive.value) {
    handleStop();
  }
}

/**
 * Start recitation session
 * 1. Request mic permission
 * 2. Start audio processing
 * 3. Fetch mock timing from API
 * 4. Start timing runner for highlighting
 */
async function handleStart() {
  const surah = currentSurah.value;
  if (!surah) return;

  // Start session state
  session.startSession(surah.number, [1, surah.ayahCount]);

  // Request microphone permission
  const stream = await media.startMic();
  if (!stream) {
    // Mic permission denied - continue with demo mode
    console.warn("Mic permission denied, running in demo mode");
    startAyahRecitation();
    return;
  }

  // Start audio processing
  audio.startProcessing(stream);

  // Start recitation for current ayah
  await startAyahRecitation();
}

/**
 * Start recitation for the current ayah
 * Fetches timing from mock API and starts the timing runner
 */
async function startAyahRecitation() {
  const ayah = currentAyah.value;
  if (!ayah) return;

  // Get word count
  const wordCount = currentWordCount.value;
  if (wordCount === 0) return;

  // Fetch mock timing from API
  const timings = await audio.fetchMockTiming(
    selectedSurahNumber.value,
    session.currentAyahNumber.value,
    wordCount
  );

  if (timings.length === 0) {
    console.error("No timings received from API");
    return;
  }

  // Create timing runner
  timingRunner = audio.createTimingRunner(
    timings,
    // On word start
    (timing: MockTajweedTiming) => {
      if (session.isPaused.value) return;

      // Set current word
      session.setCurrentWord(session.currentAyahIndex.value, timing.wordIndex);
    },
    // On word end
    (timing: MockTajweedTiming) => {
      if (session.isPaused.value) return;

      // Apply the feedback status to the word
      session.setWordHighlight(
        session.currentAyahIndex.value,
        timing.wordIndex,
        timing.status as HighlightStatus,
        timing.rulesApplied as any,
        timing.message
      );
    },
    // On complete
    async () => {
      // Check if there are more ayat
      if (session.nextAyah()) {
        // Start next ayah after a brief pause
        await new Promise((resolve) => setTimeout(resolve, 500));
        await startAyahRecitation();
      } else {
        // End of recitation
        handleStop();
      }
    }
  );

  // Start the timing runner
  timingRunner.start();
}

// Stop session
function handleStop() {
  // Stop timing runner
  if (timingRunner) {
    timingRunner.stop();
    timingRunner = null;
  }

  // Stop audio processing
  audio.stopProcessing();

  // Stop microphone
  media.stopMic();

  const summary = session.stopSession();
  if (summary) {
    // Add surah name to summary
    summary.surahName = currentSurah.value?.nameArabic || "";
    sessionSummary.value = summary;
    showSummaryModal.value = true;
  }
}

// Pause session
function handlePause() {
  session.pauseSession();
  // Note: Timing continues but callbacks check isPaused
}

// Resume session
function handleResume() {
  session.resumeSession();
}

// Toggle microphone
async function handleToggleMic() {
  await media.toggleMic();

  // If mic is now active and session is active, start audio processing
  if (
    media.isMicActive.value &&
    session.isActive.value &&
    media.micStream.value
  ) {
    audio.startProcessing(media.micStream.value);
  } else {
    audio.stopProcessing();
  }
}

// Toggle camera
async function handleToggleCamera() {
  await media.toggleCamera();
}

// Close summary modal
function handleCloseSummary() {
  showSummaryModal.value = false;
  sessionSummary.value = null;
}

// Retry recitation
function handleRetry() {
  showSummaryModal.value = false;
  sessionSummary.value = null;
  session.resetSession();
  handleStart();
}

// Go home
function handleGoHome() {
  showSummaryModal.value = false;
  router.push("/");
}

// Navigate between ayat
async function handleNextAyah() {
  if (session.nextAyah()) {
    // If session is active, start recitation for new ayah
    if (session.isActive.value && !session.isPaused.value) {
      if (timingRunner) {
        timingRunner.stop();
      }
      await startAyahRecitation();
    }
  }
}

async function handlePrevAyah() {
  if (session.prevAyah()) {
    // If session is active, start recitation for new ayah
    if (session.isActive.value && !session.isPaused.value) {
      if (timingRunner) {
        timingRunner.stop();
      }
      await startAyahRecitation();
    }
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (timingRunner) {
    timingRunner.stop();
  }
  audio.stopProcessing();
  media.stopAll();
});

// SEO
useHead({
  title: t("نور التجويد - التلاوة", "Noor Tajweed - Recite"),
});
</script>

<template>
  <div class="recite-page">
    <!-- Three.js Background Effects -->
    <ThreeSceneCanvas
      :is-active="session.isActive.value"
      :intensity="settings.effectsIntensity"
      :energy-level="audio.volumeLevel.value"
      :tajweed-score="session.tajweedScore.value"
    />

    <div class="recite-content container">
      <!-- Header Bar -->
      <header class="recite-header">
        <div class="surah-selector">
          <label for="surah-select" class="sr-only">
            {{ t("اختر السورة", "Select Surah") }}
          </label>
          <select
            id="surah-select"
            class="surah-select"
            :value="selectedSurahNumber"
            :disabled="session.isActive.value"
            @change="onSurahChange"
          >
            <option
              v-for="surah in surahList"
              :key="surah.number"
              :value="surah.number"
            >
              {{ surah.number }}. {{ surah.nameArabic }} - {{ surah.name }}
            </option>
          </select>
        </div>

        <div class="ayah-navigation" v-if="session.isActive.value">
          <button
            class="btn btn--ghost btn--icon"
            :disabled="session.currentAyahIndex.value === 0"
            @click="handlePrevAyah"
          >
            ←
          </button>
          <span class="ayah-indicator">
            {{ t("الآية", "Ayah") }} {{ session.currentAyahNumber.value }} /
            {{ currentSurah?.ayahCount }}
          </span>
          <button
            class="btn btn--ghost btn--icon"
            :disabled="
              session.currentAyahIndex.value >=
              (currentSurah?.ayahCount ?? 1) - 1
            "
            @click="handleNextAyah"
          >
            →
          </button>
        </div>

        <!-- Mic Status Indicator -->
        <div class="mic-status" v-if="session.isActive.value">
          <span
            class="mic-indicator"
            :class="{
              'mic-indicator--active': media.isMicActive.value,
              'mic-indicator--error': media.error.value,
            }"
          >
            {{ media.isMicActive.value ? "🎙️" : "🔇" }}
          </span>

          <!-- Volume Level Bar -->
          <div class="volume-bar" v-if="media.isMicActive.value">
            <div
              class="volume-bar-fill"
              :style="{ width: `${audio.volumeLevel.value * 100}%` }"
            ></div>
          </div>
        </div>
      </header>

      <!-- Main Quran Display -->
      <main class="recite-main">
        <div class="quran-container">
          <!-- Surah Name -->
          <h2 class="surah-title" v-if="currentSurah">
            سورة {{ currentSurah.nameArabic }}
          </h2>

          <!-- Bismillah (if not Al-Fatihah or At-Tawbah) -->
          <p
            v-if="
              currentSurah &&
              currentSurah.number !== 1 &&
              currentSurah.number !== 9
            "
            class="bismillah quran-text"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>

          <!-- Ayat Display -->
          <div class="ayat-container">
            <QuranTextDisplay
              v-if="currentAyah"
              :ayah-text="currentAyah.text"
              :ayah-number="currentAyah.number"
              :ayah-index="session.currentAyahIndex.value"
              :highlights="session.highlights.value"
              :kids-mode="settings.kidsMode"
              :font-size="settings.fontSize"
            />

            <!-- Empty state -->
            <div v-else class="empty-state">
              <p>{{ t("لا توجد آيات لعرضها", "No ayat to display") }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="media.error.value || audio.error.value"
            class="error-message"
          >
            {{ media.error.value || audio.error.value }}
          </div>
        </div>

        <!-- Legend Panel -->
        <aside v-if="showLegend" class="legend-panel">
          <TajweedLegend />
        </aside>
      </main>

      <!-- Controls -->
      <footer class="recite-footer">
        <RecitationControls
          :is-active="session.isActive.value"
          :is-paused="session.isPaused.value"
          :mic-enabled="media.isMicActive.value"
          :camera-enabled="media.isCameraActive.value"
          @start="handleStart"
          @stop="handleStop"
          @pause="handlePause"
          @resume="handleResume"
          @toggle-mic="handleToggleMic"
          @toggle-camera="handleToggleCamera"
        />
      </footer>
    </div>

    <!-- Session Summary Modal -->
    <SessionSummaryModal
      :is-open="showSummaryModal"
      :summary="sessionSummary"
      @close="handleCloseSummary"
      @retry="handleRetry"
      @go-home="handleGoHome"
    />
  </div>
</template>

<style scoped>
.recite-page {
  min-height: calc(100vh - 200px);
  position: relative;
  display: flex;
  flex-direction: column;
}

.recite-content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding-top: var(--space-4);
  padding-bottom: var(--space-4);
}

/* Header */
.recite-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.surah-selector {
  flex: 1;
  max-width: 400px;
}

.surah-select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-ui);
  font-size: var(--text-base);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background-color: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
}

.surah-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ayah-navigation {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.ayah-indicator {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  min-width: 100px;
  text-align: center;
}

/* Mic Status */
.mic-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.mic-indicator {
  font-size: 1.25rem;
  opacity: 0.5;
}

.mic-indicator--active {
  opacity: 1;
}

.mic-indicator--error {
  color: var(--highlight-error);
}

.volume-bar {
  width: 60px;
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.volume-bar-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--highlight-correct),
    var(--color-primary)
  );
  transition: width 0.1s ease;
}

/* Main Content */
.recite-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: var(--space-6);
  align-items: start;
}

.quran-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.surah-title {
  text-align: center;
  font-family: var(--font-quran);
  font-size: var(--text-3xl);
  color: var(--color-primary);
  margin: 0;
}

.bismillah {
  text-align: center;
  font-size: 1.5rem !important;
  margin: 0;
  padding: var(--space-4);
  color: var(--text-secondary);
}

.ayat-container {
  flex: 1;
}

.legend-panel {
  position: sticky;
  top: calc(var(--space-16) + var(--space-4));
}

/* Footer */
.recite-footer {
  margin-top: auto;
}

/* Error Message */
.error-message {
  text-align: center;
  padding: var(--space-3);
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--highlight-error);
  border-radius: var(--border-radius-md);
  color: var(--highlight-error);
  font-size: var(--text-sm);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .recite-main {
    grid-template-columns: 1fr;
  }

  .legend-panel {
    position: relative;
    top: 0;
    order: -1;
  }
}

@media (max-width: 768px) {
  .recite-header {
    flex-direction: column;
    align-items: stretch;
  }

  .surah-selector {
    max-width: none;
  }

  .ayah-navigation {
    justify-content: center;
  }

  .mic-status {
    justify-content: center;
  }
}
</style>

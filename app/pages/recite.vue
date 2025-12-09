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
  <div
    class="recite-page"
    :class="{
      'recite-page--active': session.isActive.value,
      'recite-page--kids': settings.kidsMode,
    }"
  >
    <!-- Three.js Background Effects -->
    <ThreeSceneCanvas
      :is-active="session.isActive.value"
      :intensity="settings.effectsIntensity"
      :energy-level="audio.volumeLevel.value"
      :tajweed-score="session.tajweedScore.value"
    />

    <div class="recite-layout">
      <!-- Sidebar (Desktop) -->
      <aside class="recite-sidebar">
        <!-- Surah Selector Card -->
        <div class="sidebar-card">
          <h3 class="sidebar-title">
            <span class="sidebar-icon">📖</span>
            {{ t("اختر السورة", "Select Surah") }}
          </h3>
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
              {{ surah.number }}. {{ surah.nameArabic }} ({{ surah.name }})
            </option>
          </select>
        </div>

        <!-- Session Info Card -->
        <div class="sidebar-card" v-if="session.isActive.value">
          <h3 class="sidebar-title">
            <span class="sidebar-icon">📊</span>
            {{ t("معلومات الجلسة", "Session Info") }}
          </h3>
          <div class="session-stats">
            <div class="stat-item">
              <span class="stat-label">{{ t("الآية", "Ayah") }}</span>
              <span class="stat-value"
                >{{ session.currentAyahNumber.value }} /
                {{ currentSurah?.ayahCount }}</span
              >
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t("الكلمة", "Word") }}</span>
              <span class="stat-value"
                >{{ session.currentWordIndex.value + 1 }} /
                {{ currentWordCount }}</span
              >
            </div>
            <div class="stat-item">
              <span class="stat-label">{{ t("النتيجة", "Score") }}</span>
              <span class="stat-value stat-value--score"
                >{{ Math.round(session.tajweedScore.value * 100) }}%</span
              >
            </div>
          </div>

          <!-- Volume Indicator -->
          <div class="volume-indicator" v-if="media.isMicActive.value">
            <span class="volume-label">
              <span
                class="mic-dot"
                :class="{ 'mic-dot--active': audio.volumeLevel.value > 0.1 }"
              ></span>
              {{ t("مستوى الصوت", "Volume") }}
            </span>
            <div class="volume-bar-lg">
              <div
                class="volume-bar-lg-fill"
                :style="{ width: `${audio.volumeLevel.value * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Legend Card -->
        <div class="sidebar-card sidebar-card--legend" v-if="showLegend">
          <h3 class="sidebar-title">
            <span class="sidebar-icon">🎨</span>
            {{ t("دليل الألوان", "Color Guide") }}
          </h3>
          <TajweedLegend />
        </div>
      </aside>

      <!-- Main Content -->
      <main class="recite-main">
        <!-- Quran Display Card -->
        <div class="quran-card">
          <!-- Surah Header -->
          <header class="quran-header" v-if="currentSurah">
            <h2 class="surah-title">
              <span class="surah-title-ar"
                >سورة {{ currentSurah.nameArabic }}</span
              >
              <span class="surah-title-en">Surah {{ currentSurah.name }}</span>
            </h2>
            <div class="surah-meta">
              <span
                >{{ currentSurah.ayahCount }} {{ t("آيات", "verses") }}</span
              >
              <span class="meta-dot">•</span>
              <span>{{
                currentSurah.number === 1
                  ? t("مكية", "Meccan")
                  : currentSurah.number > 20
                  ? t("مكية", "Meccan")
                  : t("مدنية", "Medinan")
              }}</span>
            </div>
          </header>

          <!-- Bismillah -->
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

          <!-- Ayah Navigation (during session) -->
          <div class="ayah-nav" v-if="session.isActive.value">
            <button
              class="ayah-nav-btn"
              :disabled="session.currentAyahIndex.value === 0"
              @click="handlePrevAyah"
            >
              <span class="nav-arrow">→</span>
              {{ t("السابقة", "Previous") }}
            </button>
            <span class="ayah-badge">
              {{ t("الآية", "Ayah") }} {{ session.currentAyahNumber.value }}
            </span>
            <button
              class="ayah-nav-btn"
              :disabled="
                session.currentAyahIndex.value >=
                (currentSurah?.ayahCount ?? 1) - 1
              "
              @click="handleNextAyah"
            >
              {{ t("التالية", "Next") }}
              <span class="nav-arrow">←</span>
            </button>
          </div>

          <!-- Quran Text Display -->
          <div class="quran-text-wrapper">
            <QuranTextDisplay
              v-if="currentAyah"
              :ayah-text="currentAyah.text"
              :ayah-number="currentAyah.number"
              :ayah-index="session.currentAyahIndex.value"
              :highlights="session.highlights.value"
              :kids-mode="settings.kidsMode"
              :font-size="settings.fontSize"
            />

            <div v-else class="empty-state">
              <span class="empty-icon">📖</span>
              <p>{{ t("لا توجد آيات لعرضها", "No ayat to display") }}</p>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="media.error.value || audio.error.value"
            class="error-banner"
          >
            <span class="error-icon">⚠️</span>
            {{ media.error.value || audio.error.value }}
          </div>
        </div>

        <!-- Controls Footer -->
        <footer class="controls-footer">
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
      </main>
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
/* ==========================================
   Recite Page - Polished Layout
   ========================================== */
.recite-page {
  min-height: calc(100vh - 80px);
  position: relative;
}

/* ==========================================
   Layout
   ========================================== */
.recite-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-6);
  min-height: calc(100vh - 120px);
}

/* ==========================================
   Sidebar
   ========================================== */
.recite-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sidebar-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-4);
}

.sidebar-icon {
  font-size: 1.1rem;
}

.surah-select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-ui);
  font-size: var(--text-base);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.surah-select:hover:not(:disabled) {
  border-color: var(--color-primary);
}

.surah-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
}

.surah-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Session Stats */
.session-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.stat-value {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value--score {
  color: var(--highlight-correct);
}

/* Volume Indicator */
.volume-indicator {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-color);
}

.volume-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.mic-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--text-muted);
  transition: all var(--transition-fast);
}

.mic-dot--active {
  background-color: var(--highlight-correct);
  box-shadow: 0 0 8px var(--highlight-correct);
}

.volume-bar-lg {
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-full);
  overflow: hidden;
}

.volume-bar-lg-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--highlight-correct),
    var(--color-primary)
  );
  transition: width 0.1s ease;
  border-radius: var(--border-radius-full);
}

/* ==========================================
   Main Content Area
   ========================================== */
.recite-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.quran-card {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-md);
}

/* Surah Header */
.quran-header {
  text-align: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.surah-title {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: 0;
}

.surah-title-ar {
  font-family: var(--font-quran);
  font-size: var(--text-3xl);
  font-weight: 400;
  color: var(--color-primary);
}

.surah-title-en {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.surah-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.meta-dot {
  opacity: 0.5;
}

/* Bismillah */
.bismillah {
  text-align: center;
  font-size: 1.5rem !important;
  padding: var(--space-4);
  color: var(--text-secondary);
  margin: 0 0 var(--space-4);
}

/* Ayah Navigation */
.ayah-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.ayah-nav-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ayah-nav-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.ayah-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-arrow {
  font-size: var(--text-lg);
}

.ayah-badge {
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary);
  color: white;
  border-radius: var(--border-radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
}

/* Quran Text */
.quran-text-wrapper {
  min-height: 200px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--text-muted);
}

.empty-icon {
  display: block;
  font-size: 3rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

/* Error Banner */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: var(--space-3);
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--highlight-error);
  border-radius: var(--border-radius-md);
  color: var(--highlight-error);
  font-size: var(--text-sm);
}

.error-icon {
  font-size: var(--text-base);
}

/* Controls Footer */
.controls-footer {
  margin-top: auto;
}

/* ==========================================
   Kids Mode Enhancements
   ========================================== */
.recite-page--kids .surah-title-ar {
  font-size: var(--text-4xl);
}

.recite-page--kids .quran-card {
  padding: var(--space-10);
}

.recite-page--kids .ayah-badge {
  font-size: var(--text-lg);
  padding: var(--space-3) var(--space-5);
}

/* ==========================================
   Responsive
   ========================================== */
@media (max-width: 1024px) {
  .recite-layout {
    grid-template-columns: 1fr;
    padding: var(--space-4);
  }

  .recite-sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    order: 1;
  }

  .sidebar-card {
    flex: 1;
    min-width: 200px;
  }

  .sidebar-card--legend {
    width: 100%;
  }

  .recite-main {
    order: 0;
  }
}

@media (max-width: 768px) {
  .recite-layout {
    gap: var(--space-4);
  }

  .recite-sidebar {
    flex-direction: column;
  }

  .sidebar-card {
    min-width: auto;
  }

  .quran-card {
    padding: var(--space-4);
  }

  .surah-title-ar {
    font-size: var(--text-2xl);
  }

  .ayah-nav {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .ayah-nav-btn {
    font-size: var(--text-xs);
    padding: var(--space-2) var(--space-3);
  }
}
/* ==========================================
   Kids Mode Overrides
   ========================================== */
.recite-page--kids {
  --color-primary: #8e44ad; /* Playful Purple */
  --color-primary-light: #9b59b6;
  --highlight-correct: #27ae60; /* Bright Green */
  --text-primary: #2c3e50;
  --bg-card: #fff;
  --border-radius-xl: 2rem;
  --border-radius-lg: 1.5rem;
}

.recite-page--kids .recite-sidebar .sidebar-card {
  border: 2px solid #f1c40f; /* Yellow Border */
  background: #fffdf5; /* Warm background */
  box-shadow: 0 8px 16px rgba(241, 196, 15, 0.15);
}

.recite-page--kids .sidebar-title {
  color: #e67e22; /* Carrot Orange */
  font-size: 1.1rem;
  font-weight: 700;
}

.recite-page--kids .surah-select {
  border: 2px solid #8e44ad;
  color: #8e44ad;
  font-weight: 600;
}

.recite-page--kids .stat-item {
  background: #fff;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--space-2);
}

.recite-page--kids .stat-value--score {
  color: #27ae60;
  font-size: 1.25rem;
}

.recite-page--kids .quran-card {
  border: 4px solid #8e44ad;
  box-shadow: 0 12px 24px rgba(142, 68, 173, 0.1);
  background-image: radial-gradient(
      circle at top right,
      rgba(241, 196, 15, 0.05),
      transparent 30%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(142, 68, 173, 0.05),
      transparent 30%
    );
}

.recite-page--kids .surah-title-ar {
  color: #8e44ad;
  text-shadow: 2px 2px 0px rgba(142, 68, 173, 0.1);
  transform: scale(1.1);
}

.recite-page--kids .ayah-badge {
  background: linear-gradient(135deg, #f1c40f, #f39c12);
  color: #fff;
  font-size: 1.1rem;
  padding: 0.5rem 1.5rem;
  border: 2px solid #fff;
  box-shadow: 0 4px 8px rgba(243, 156, 18, 0.3);
}

.recite-page--kids .ayah-nav-btn {
  border: 2px solid #e1e1e1;
  font-weight: 700;
}

.recite-page--kids .ayah-nav-btn:hover:not(:disabled) {
  background: #8e44ad;
  border-color: #8e44ad;
  transform: scale(1.05);
}
</style>

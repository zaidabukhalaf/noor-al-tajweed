<script setup lang="ts">
/**
 * Audio Test Page (/audio-test)
 *
 * Debug page for testing microphone capture and audio processing.
 * Shows real-time volume level, permission status, and mic stream info.
 */

const { t, settings } = useAppSettings();

// Media devices
const media = useMediaDevices();

// Audio processing
const audio = useAudioStream();

// Test state
const isTestActive = ref(false);
const testDuration = ref(0);
let testInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start audio test
 */
async function startTest() {
  // Request mic permission
  const stream = await media.startMic();
  if (!stream) {
    console.error("Failed to get mic stream");
    return;
  }

  // Start audio processing
  audio.startProcessing(stream);

  // Start timer
  isTestActive.value = true;
  testDuration.value = 0;
  testInterval = setInterval(() => {
    testDuration.value++;
  }, 1000);
}

/**
 * Stop audio test
 */
function stopTest() {
  isTestActive.value = false;

  // Stop timer
  if (testInterval) {
    clearInterval(testInterval);
    testInterval = null;
  }

  // Stop processing
  audio.stopProcessing();

  // Stop mic
  media.stopMic();
}

/**
 * Format duration
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get volume bar color based on level
 */
function getVolumeColor(level: number): string {
  if (level < 0.3) return "var(--highlight-correct)";
  if (level < 0.7) return "var(--highlight-warning)";
  return "var(--highlight-error)";
}

// Cleanup
onUnmounted(() => {
  stopTest();
});

// SEO
useHead({
  title: t("نور التجويد - اختبار الصوت", "Noor Tajweed - Audio Test"),
});
</script>

<template>
  <div class="audio-test-page container container--narrow">
    <h1 class="page-title">
      {{ t("اختبار الميكروفون", "Microphone Test") }}
    </h1>
    <p class="subtitle">
      {{
        t(
          "تأكد من عمل الميكروفون قبل بدء التلاوة",
          "Verify your microphone works before reciting"
        )
      }}
    </p>

    <!-- Status Cards -->
    <div class="status-grid">
      <!-- Browser Support -->
      <div class="status-card card">
        <span class="status-icon">{{
          media.isMicSupported.value ? "✅" : "❌"
        }}</span>
        <span class="status-label">
          {{ t("دعم المتصفح", "Browser Support") }}
        </span>
        <span class="status-value">
          {{
            media.isMicSupported.value
              ? t("مدعوم", "Supported")
              : t("غير مدعوم", "Not Supported")
          }}
        </span>
      </div>

      <!-- Permission Status -->
      <div class="status-card card">
        <span class="status-icon">{{
          media.isMicGranted.value ? "🔓" : "🔒"
        }}</span>
        <span class="status-label">
          {{ t("الإذن", "Permission") }}
        </span>
        <span class="status-value">
          {{
            media.isMicGranted.value
              ? t("مسموح", "Granted")
              : t("غير مطلوب", "Not Requested")
          }}
        </span>
      </div>

      <!-- Mic Active -->
      <div class="status-card card">
        <span class="status-icon">{{
          media.isMicActive.value ? "🎙️" : "🔇"
        }}</span>
        <span class="status-label">
          {{ t("الحالة", "Status") }}
        </span>
        <span class="status-value">
          {{
            media.isMicActive.value
              ? t("نشط", "Active")
              : t("غير نشط", "Inactive")
          }}
        </span>
      </div>

      <!-- Audio Processing -->
      <div class="status-card card">
        <span class="status-icon">{{
          audio.isProcessing.value ? "📊" : "⏸️"
        }}</span>
        <span class="status-label">
          {{ t("المعالجة", "Processing") }}
        </span>
        <span class="status-value">
          {{
            audio.isProcessing.value
              ? t("يعمل", "Running")
              : t("متوقف", "Stopped")
          }}
        </span>
      </div>
    </div>

    <!-- Volume Meter -->
    <div class="volume-section card">
      <h2 class="section-title">
        {{ t("مستوى الصوت", "Volume Level") }}
      </h2>

      <div class="volume-meter">
        <div
          class="volume-meter-fill"
          :style="{
            width: `${audio.volumeLevel.value * 100}%`,
            backgroundColor: getVolumeColor(audio.volumeLevel.value),
          }"
        ></div>
      </div>

      <div class="volume-labels">
        <span>{{ t("منخفض", "Low") }}</span>
        <span class="volume-percentage">
          {{ Math.round(audio.volumeLevel.value * 100) }}%
        </span>
        <span>{{ t("مرتفع", "High") }}</span>
      </div>

      <!-- Visual Feedback -->
      <div class="volume-visual" v-if="audio.isProcessing.value">
        <div
          v-for="i in 10"
          :key="i"
          class="volume-bar"
          :class="{
            'volume-bar--active': audio.volumeLevel.value * 10 >= i,
          }"
        ></div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-section">
      <button
        v-if="!isTestActive"
        class="btn btn--primary btn--lg"
        :disabled="!media.isMicSupported.value"
        @click="startTest"
      >
        {{ t("ابدأ الاختبار", "Start Test") }}
      </button>

      <button v-else class="btn btn--secondary btn--lg" @click="stopTest">
        {{ t("إيقاف الاختبار", "Stop Test") }}
      </button>

      <p v-if="isTestActive" class="test-duration">
        {{ t("مدة الاختبار:", "Test Duration:") }}
        {{ formatDuration(testDuration) }}
      </p>
    </div>

    <!-- Error Display -->
    <div
      v-if="media.error.value || audio.error.value"
      class="error-section card"
    >
      <h3 class="error-title">{{ t("خطأ", "Error") }}</h3>
      <p class="error-message">{{ media.error.value || audio.error.value }}</p>
    </div>

    <!-- Instructions -->
    <div class="instructions card">
      <h3>{{ t("تعليمات", "Instructions") }}</h3>
      <ol>
        <li>
          {{
            t('انقر على "ابدأ الاختبار" للبدء', 'Click "Start Test" to begin')
          }}
        </li>
        <li>
          {{
            t(
              "امنح الإذن للميكروفون عند طلبه",
              "Grant microphone permission when prompted"
            )
          }}
        </li>
        <li>
          {{
            t(
              "تحدث أو اقرأ لرؤية مستوى الصوت",
              "Speak or recite to see the volume level"
            )
          }}
        </li>
        <li>
          {{
            t(
              "يجب أن يتحرك مؤشر الصوت عند التحدث",
              "The volume meter should move when you speak"
            )
          }}
        </li>
      </ol>
    </div>

    <!-- Three.js Visual Preview -->
    <div class="threejs-preview card">
      <h3>{{ t("معاينة التأثيرات البصرية", "Visual Effects Preview") }}</h3>
      <p class="preview-desc">
        {{
          t(
            "المؤثرات تستجيب لمستوى الصوت",
            "Effects respond to your voice level"
          )
        }}
      </p>

      <div class="preview-container">
        <ThreeSceneCanvas
          :is-active="isTestActive"
          :intensity="settings.effectsIntensity"
          :energy-level="audio.volumeLevel.value"
          :tajweed-score="0.7"
          :contained="true"
        />
      </div>

      <!-- Debug Values -->
      <div class="debug-values" v-if="isTestActive">
        <div class="debug-item">
          <span class="debug-label">Energy Level:</span>
          <span class="debug-value"
            >{{ (audio.volumeLevel.value * 100).toFixed(1) }}%</span
          >
        </div>
        <div class="debug-item">
          <span class="debug-label">Effects Intensity:</span>
          <span class="debug-value">{{ settings.effectsIntensity }}</span>
        </div>
      </div>
    </div>

    <!-- Back Link -->
    <NuxtLink to="/recite" class="btn btn--ghost">
      {{ t("العودة للتلاوة", "Back to Recite") }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.audio-test-page {
  padding-top: var(--space-8);
  padding-bottom: var(--space-8);
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

/* Status Grid */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.status-card {
  text-align: center;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.status-icon {
  font-size: 2rem;
}

.status-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-transform: uppercase;
}

.status-value {
  font-weight: 600;
  color: var(--text-primary);
}

/* Volume Section */
.volume-section {
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.section-title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-4);
  text-align: center;
}

.volume-meter {
  height: 24px;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.volume-meter-fill {
  height: 100%;
  transition: width 0.1s ease, background-color 0.3s ease;
  border-radius: var(--border-radius-full);
}

.volume-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.volume-percentage {
  font-weight: 600;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

/* Visual Bars */
.volume-visual {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

.volume-bar {
  width: 20px;
  height: 40px;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
  transition: background-color 0.1s ease, transform 0.1s ease;
}

.volume-bar--active {
  background-color: var(--color-primary);
  transform: scaleY(1.1);
}

/* Controls */
.controls-section {
  text-align: center;
  margin-bottom: var(--space-6);
}

.test-duration {
  margin-top: var(--space-3);
  color: var(--text-secondary);
}

/* Error */
.error-section {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: var(--highlight-error);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.error-title {
  color: var(--highlight-error);
  margin-bottom: var(--space-2);
}

.error-message {
  color: var(--text-primary);
  margin: 0;
}

/* Instructions */
.instructions {
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.instructions h3 {
  font-size: var(--text-base);
  margin-bottom: var(--space-3);
}

.instructions ol {
  padding-inline-start: var(--space-6);
  margin: 0;
}

.instructions li {
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
}

/* Three.js Preview */
.threejs-preview {
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.threejs-preview h3 {
  font-size: var(--text-base);
  margin-bottom: var(--space-2);
}

.preview-desc {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

.preview-container {
  position: relative;
  height: 200px;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  background: var(--bg-secondary);
}

.debug-values {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.debug-item {
  display: flex;
  gap: var(--space-2);
}

.debug-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.debug-value {
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: monospace;
  color: var(--color-primary);
}
</style>

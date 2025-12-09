<script setup lang="ts">
/**
 * SessionSummaryModal.vue
 *
 * Displays the session summary after completing a recitation session.
 * Shows score, breakdown, and encouraging messages.
 */

import type { SessionSummary } from "~/types";

interface Props {
  /** Is the modal visible? */
  isOpen: boolean;
  /** Session summary data */
  summary: SessionSummary | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "retry"): void;
  (e: "goHome"): void;
}>();

const { t } = useAppSettings();

// Format duration
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${seconds}s`;
}

// Get encouraging message based on score
const encouragingMessage = computed(() => {
  if (!props.summary) return "";

  const score = props.summary.overallScore;

  if (score >= 90) {
    return t(
      "ممتاز! ما شاء الله، أداء رائع!",
      "Excellent! Masha'Allah, wonderful performance!"
    );
  }
  if (score >= 75) {
    return t(
      "أحسنت! أداء جيد جداً، استمر!",
      "Well done! Very good performance, keep going!"
    );
  }
  if (score >= 60) {
    return t(
      "جيد! تقدم ملحوظ، واصل التمرين.",
      "Good! Notable progress, continue practicing."
    );
  }
  return t(
    "بداية طيبة! التمرين المستمر يصنع الفرق.",
    "A good start! Consistent practice makes a difference."
  );
});

// Score color
const scoreColor = computed(() => {
  if (!props.summary) return "var(--text-primary)";

  const score = props.summary.overallScore;
  if (score >= 80) return "var(--highlight-correct)";
  if (score >= 60) return "var(--highlight-warning)";
  return "var(--highlight-error)";
});

// Close modal on backdrop click
function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit("close");
  }
}

// Close on Escape key
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    emit("close");
  }
}

// Add/remove keyboard listener
onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen && summary"
        class="modal-backdrop"
        @click="onBackdropClick"
      >
        <div
          class="modal"
          role="dialog"
          :aria-label="t('ملخص الجلسة', 'Session Summary')"
          aria-modal="true"
        >
          <!-- Header -->
          <div class="modal-header">
            <h2 class="modal-title">
              {{ t("ملخص الجلسة", "Session Summary") }}
            </h2>
            <button
              class="btn btn--ghost btn--icon modal-close"
              :aria-label="t('إغلاق', 'Close')"
              @click="emit('close')"
            >
              ✖️
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <!-- Score Circle -->
            <div class="score-section">
              <div
                class="score-circle"
                :style="{ '--score-color': scoreColor }"
              >
                <span class="score-value">{{ summary.overallScore }}</span>
                <span class="score-label">%</span>
              </div>
              <p class="encourage-message">{{ encouragingMessage }}</p>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-icon">📖</span>
                <span class="stat-value">{{ summary.totalWords }}</span>
                <span class="stat-label">{{ t("كلمة", "Words") }}</span>
              </div>

              <div class="stat-item stat-item--correct">
                <span class="stat-icon">✅</span>
                <span class="stat-value">{{ summary.correctCount }}</span>
                <span class="stat-label">{{ t("صحيح", "Correct") }}</span>
              </div>

              <div class="stat-item stat-item--warning">
                <span class="stat-icon">⚠️</span>
                <span class="stat-value">{{ summary.warningCount }}</span>
                <span class="stat-label">{{ t("تحسين", "Improve") }}</span>
              </div>

              <div class="stat-item stat-item--error">
                <span class="stat-icon">❌</span>
                <span class="stat-value">{{ summary.errorCount }}</span>
                <span class="stat-label">{{ t("خطأ", "Errors") }}</span>
              </div>

              <div class="stat-item">
                <span class="stat-icon">⏱️</span>
                <span class="stat-value">{{
                  formatDuration(summary.duration)
                }}</span>
                <span class="stat-label">{{ t("المدة", "Duration") }}</span>
              </div>
            </div>

            <!-- Surah Info -->
            <div class="surah-info">
              <span class="surah-label">{{ t("السورة:", "Surah:") }}</span>
              <span class="surah-name">{{
                summary.surahName || `Surah ${summary.surahNumber}`
              }}</span>
              <span class="ayah-range">
                ({{ t("الآيات", "Ayat") }} {{ summary.ayahRange[0] }}-{{
                  summary.ayahRange[1]
                }})
              </span>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn btn--secondary" @click="emit('goHome')">
              {{ t("العودة للرئيسية", "Go Home") }}
            </button>
            <button class="btn btn--primary" @click="emit('retry')">
              {{ t("إعادة التلاوة", "Recite Again") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-4);
}

.modal {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-xl);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin: 0;
}

.modal-close {
  font-size: 1.25rem;
}

.modal-body {
  padding: var(--space-6);
}

.modal-footer {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

/* Score Section */
.score-section {
  text-align: center;
  margin-bottom: var(--space-6);
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--score-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(212, 175, 55, 0.1) 100%
  );
}

.score-value {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--score-color);
  line-height: 1;
}

.score-label {
  font-size: var(--text-lg);
  color: var(--score-color);
}

.encourage-message {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-item {
  text-align: center;
  padding: var(--space-3);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
}

.stat-icon {
  display: block;
  font-size: 1.5rem;
  margin-bottom: var(--space-2);
}

.stat-value {
  display: block;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  display: block;
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.stat-item--correct .stat-value {
  color: var(--highlight-correct);
}

.stat-item--warning .stat-value {
  color: var(--highlight-warning);
}

.stat-item--error .stat-value {
  color: var(--highlight-error);
}

/* Surah Info */
.surah-info {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.surah-name {
  font-weight: 600;
  color: var(--text-primary);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform var(--transition-normal);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal {
  transform: scale(0.95) translateY(20px);
}

.modal-leave-to .modal {
  transform: scale(0.95) translateY(20px);
}

/* Mobile */
@media (max-width: 768px) {
  .modal {
    max-height: 100vh;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    margin-top: auto;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-footer .btn {
    width: 100%;
  }
}
</style>

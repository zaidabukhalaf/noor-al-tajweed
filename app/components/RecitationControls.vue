<script setup lang="ts">
/**
 * RecitationControls.vue
 *
 * Control buttons for the recitation session.
 * Start/Stop, Mic, Camera toggles, and settings access.
 */

interface Props {
  /** Is the recitation session active? */
  isActive?: boolean;
  /** Is the session paused? */
  isPaused?: boolean;
  /** Is the microphone enabled? */
  micEnabled?: boolean;
  /** Is the camera enabled? */
  cameraEnabled?: boolean;
  /** Show camera toggle? */
  showCameraToggle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  isPaused: false,
  micEnabled: true,
  cameraEnabled: false,
  showCameraToggle: true,
});

const emit = defineEmits<{
  (e: "start"): void;
  (e: "stop"): void;
  (e: "pause"): void;
  (e: "resume"): void;
  (e: "toggleMic"): void;
  (e: "toggleCamera"): void;
  (e: "openSettings"): void;
  (e: "exit"): void;
}>();

const { t } = useAppSettings();

// Main action button
function onMainAction() {
  if (!props.isActive) {
    emit("start");
  } else if (props.isPaused) {
    emit("resume");
  } else {
    emit("pause");
  }
}

// Get main button label
const mainButtonLabel = computed(() => {
  if (!props.isActive) {
    return t("ابدأ التلاوة", "Start Reciting");
  }
  if (props.isPaused) {
    return t("استمرار", "Resume");
  }
  return t("إيقاف مؤقت", "Pause");
});

// Get main button icon
const mainButtonIcon = computed(() => {
  if (!props.isActive) return "▶️";
  if (props.isPaused) return "▶️";
  return "⏸️";
});
</script>

<template>
  <div class="controls">
    <div class="controls-main">
      <!-- Main Start/Pause Button -->
      <button
        class="btn btn--primary btn--lg control-btn control-btn--main"
        @click="onMainAction"
      >
        <span class="control-icon">{{ mainButtonIcon }}</span>
        <span class="control-label">{{ mainButtonLabel }}</span>
      </button>

      <!-- Stop Button (only when active) -->
      <button
        v-if="isActive"
        class="btn btn--secondary control-btn"
        :aria-label="t('إنهاء الجلسة', 'End session')"
        @click="emit('stop')"
      >
        <span class="control-icon">⏹️</span>
        <span class="control-label">{{ t("إنهاء", "Stop") }}</span>
      </button>
    </div>

    <div class="controls-secondary">
      <!-- Microphone Toggle -->
      <button
        class="btn control-btn"
        :class="[micEnabled ? 'btn--primary' : 'btn--secondary']"
        :aria-label="t('تبديل الميكروفون', 'Toggle microphone')"
        :aria-pressed="micEnabled"
        @click="emit('toggleMic')"
      >
        <span class="control-icon">{{ micEnabled ? "🎤" : "🔇" }}</span>
        <span class="control-label-small">
          {{ micEnabled ? t("مفعل", "On") : t("معطل", "Off") }}
        </span>
      </button>

      <!-- Camera Toggle -->
      <button
        v-if="showCameraToggle"
        class="btn control-btn"
        :class="[cameraEnabled ? 'btn--primary' : 'btn--secondary']"
        :aria-label="t('تبديل الكاميرا', 'Toggle camera')"
        :aria-pressed="cameraEnabled"
        @click="emit('toggleCamera')"
      >
        <span class="control-icon">{{ cameraEnabled ? "📷" : "📷" }}</span>
        <span class="control-label-small">
          {{ cameraEnabled ? t("مفعلة", "On") : t("معطلة", "Off") }}
        </span>
      </button>

      <!-- Settings -->
      <button
        class="btn btn--ghost control-btn"
        :aria-label="t('الإعدادات', 'Settings')"
        @click="emit('openSettings')"
      >
        <span class="control-icon">⚙️</span>
      </button>

      <!-- Exit -->
      <NuxtLink
        to="/"
        class="btn btn--ghost control-btn"
        :aria-label="t('الخروج', 'Exit')"
      >
        <span class="control-icon">✖️</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
  background-color: var(--bg-card);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-color);
}

.controls-main {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
}

.controls-secondary {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.control-btn--main {
  flex-direction: row;
  gap: var(--space-3);
  min-width: 180px;
}

.control-icon {
  font-size: 1.5rem;
}

.control-label {
  font-size: var(--text-base);
  font-weight: 600;
}

.control-label-small {
  font-size: var(--text-xs);
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .controls {
    padding: var(--space-4);
    border-radius: var(--border-radius-lg);
  }

  .controls-main {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }

  .control-btn--main {
    width: 100%;
    justify-content: center;
    min-height: 56px; /* Large touch target */
    font-size: var(--text-lg);
  }

  .control-btn--main .control-icon {
    font-size: 1.75rem;
  }

  /* Secondary controls - row with larger tap targets */
  .controls-secondary {
    gap: var(--space-2);
    flex-wrap: wrap;
    justify-content: center;
  }

  .controls-secondary .control-btn {
    min-width: 48px;
    min-height: 48px;
    padding: var(--space-2);
  }

  .control-label-small {
    display: none; /* Hide labels on mobile, icons are clear */
  }
}

/* Small phones */
@media (max-width: 480px) {
  .controls {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .control-btn--main {
    min-height: 60px;
    font-size: var(--text-xl);
    gap: var(--space-2);
  }

  .control-btn--main .control-icon {
    font-size: 2rem;
  }
}
</style>

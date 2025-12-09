<script setup lang="ts">
/**
 * ThreeSceneCanvas.vue
 *
 * Placeholder for Three.js visual effects.
 * Will be implemented in Phase 3 with subtle particles and light effects.
 */

interface Props {
  /** Effects intensity level */
  intensity?: "off" | "low" | "normal";
  /** Voice energy level (0-1) for reactive effects */
  voiceEnergy?: number;
  /** Correctness score (0-1) for color effects */
  correctnessScore?: number;
  /** Is the scene active? */
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  intensity: "normal",
  voiceEnergy: 0,
  correctnessScore: 1,
  isActive: false,
});

const { t } = useAppSettings();

// Placeholder - actual Three.js implementation in Phase 3
const showPlaceholder = computed(() => props.intensity !== "off");
</script>

<template>
  <div
    v-if="showPlaceholder"
    class="three-canvas"
    :class="{
      'three-canvas--active': isActive,
      'three-canvas--low': intensity === 'low',
    }"
  >
    <!-- Placeholder visual effect using CSS -->
    <div class="three-placeholder">
      <div class="glow-ring glow-ring--1"></div>
      <div class="glow-ring glow-ring--2"></div>
      <div class="glow-ring glow-ring--3"></div>

      <!-- Center decoration -->
      <div class="center-glow">
        <span class="center-icon">✨</span>
      </div>
    </div>

    <p class="three-label">
      {{ t("تأثيرات بصرية (قريباً)", "Visual Effects (Coming Soon)") }}
    </p>
  </div>
</template>

<style scoped>
.three-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
  opacity: 0.3;
  transition: opacity var(--transition-slow);
}

.three-canvas--active {
  opacity: 0.5;
}

.three-canvas--low {
  opacity: 0.15;
}

.three-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Glow rings animation */
.glow-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--color-primary);
  opacity: 0.3;
  animation: pulse-ring 4s ease-in-out infinite;
}

.glow-ring--1 {
  width: 200px;
  height: 200px;
  animation-delay: 0s;
}

.glow-ring--2 {
  width: 300px;
  height: 300px;
  animation-delay: 0.5s;
}

.glow-ring--3 {
  width: 400px;
  height: 400px;
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.1;
  }
}

.center-glow {
  position: relative;
  z-index: 1;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.2) 0%,
    transparent 70%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-icon {
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.three-label {
  position: absolute;
  bottom: var(--space-4);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-xs);
  color: var(--text-muted);
  opacity: 0.5;
}

/* Hide on mobile */
@media (max-width: 768px) {
  .three-canvas {
    display: none;
  }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .glow-ring,
  .center-icon {
    animation: none;
  }
}
</style>

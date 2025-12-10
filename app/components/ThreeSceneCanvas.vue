<script setup lang="ts">
/**
 * ThreeSceneCanvas.vue
 *
 * A calming ambient visual layer that responds to recitation energy.
 * Uses CSS-based effects for better cross-theme visibility.
 *
 * Design principles:
 * - Subtle ambient glow, not distracting particles
 * - Visible in both light and dark themes
 * - Slow, meditative breathing motion
 * - Never competes with Qur'an text
 */

interface Props {
  /** Whether the recitation session is active */
  isActive: boolean;
  /** Voice energy level from mic (0-1) */
  energyLevel?: number;
  /** Tajwīd correctness score (0-1) */
  tajweedScore?: number;
  /** Effects intensity: 'off' | 'low' | 'normal' */
  intensity?: "off" | "low" | "normal";
  /** If true, renders within its container instead of full-page fixed */
  contained?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  energyLevel: 0,
  tajweedScore: 0.5,
  intensity: "normal",
  contained: false,
});

// Computed styles based on energy and score
const glowIntensity = computed(() => {
  if (props.intensity === "off") return 0;
  const base = props.intensity === "low" ? 0.03 : 0.06;
  const energy = props.energyLevel * (props.intensity === "low" ? 0.08 : 0.15);
  return base + energy;
});

const glowScale = computed(() => {
  const base = 1;
  const energy = props.energyLevel * 0.05;
  return base + energy;
});

// Subtle color shift based on tajweed score
// Warmer (gold) for good score, cooler (silver) for needs improvement
const glowColor = computed(() => {
  const score = props.tajweedScore;
  // Interpolate between silver-white and warm gold
  const r = Math.round(220 + score * 35); // 220 -> 255
  const g = Math.round(215 + score * 25); // 215 -> 240
  const b = Math.round(200 - score * 30); // 200 -> 170
  return `rgb(${r}, ${g}, ${b})`;
});

// Animation speed - slower is more calming
const breatheDuration = computed(() => {
  if (props.intensity === "off") return "0s";
  const base = props.intensity === "low" ? 8 : 6;
  const energyFactor = 1 - props.energyLevel * 0.3; // Slightly faster at high energy
  return `${base * energyFactor}s`;
});
</script>

<template>
  <div
    class="ambient-container"
    :class="{
      'ambient-container--active': isActive,
      'ambient-container--contained': contained,
      'ambient-container--off': intensity === 'off',
    }"
  >
    <!-- Base gradient background -->
    <div class="ambient-gradient"></div>

    <!-- Breathing glow orb - central soft light -->
    <div
      class="ambient-orb ambient-orb--primary"
      :style="{
        '--glow-opacity': glowIntensity,
        '--glow-scale': glowScale,
        '--glow-color': glowColor,
        '--breathe-duration': breatheDuration,
      }"
    ></div>

    <!-- Secondary orb - offset for depth -->
    <div
      class="ambient-orb ambient-orb--secondary"
      :style="{
        '--glow-opacity': glowIntensity * 0.6,
        '--glow-scale': glowScale * 0.8,
        '--glow-color': glowColor,
        '--breathe-duration': breatheDuration,
      }"
    ></div>

    <!-- Corner accent lights -->
    <div
      class="ambient-accent ambient-accent--top-right"
      :style="{ '--accent-opacity': glowIntensity * 0.5 }"
    ></div>
    <div
      class="ambient-accent ambient-accent--bottom-left"
      :style="{ '--accent-opacity': glowIntensity * 0.4 }"
    ></div>
  </div>
</template>

<style scoped>
.ambient-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  transition: opacity 0.5s ease;
  opacity: 0.8;
}

.ambient-container--contained {
  position: absolute;
  z-index: 0;
  opacity: 1;
}

.ambient-container--active {
  opacity: 1;
}

.ambient-container--off {
  display: none;
}

/* Base gradient */
.ambient-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 30%,
    var(--bg-secondary) 0%,
    var(--bg-primary) 60%
  );
}

/* Breathing glow orbs */
.ambient-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
  animation: breathe var(--breathe-duration, 6s) ease-in-out infinite;
}

.ambient-orb--primary {
  top: 20%;
  left: 50%;
  width: 50vw;
  height: 50vw;
  max-width: 600px;
  max-height: 600px;
  transform: translate(-50%, -50%) scale(var(--glow-scale, 1));
  background: radial-gradient(
    circle,
    var(--glow-color, rgba(245, 235, 200, 1)) 0%,
    transparent 70%
  );
  opacity: var(--glow-opacity, 0.06);
}

.ambient-orb--secondary {
  top: 70%;
  left: 30%;
  width: 40vw;
  height: 40vw;
  max-width: 500px;
  max-height: 500px;
  transform: translate(-50%, -50%) scale(var(--glow-scale, 1));
  background: radial-gradient(
    circle,
    var(--glow-color, rgba(245, 235, 200, 1)) 0%,
    transparent 70%
  );
  opacity: var(--glow-opacity, 0.04);
  animation-delay: -3s;
}

/* Corner accent lights */
.ambient-accent {
  position: absolute;
  width: 30vw;
  height: 30vw;
  max-width: 300px;
  max-height: 300px;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.ambient-accent--top-right {
  top: -5%;
  right: -5%;
  background: radial-gradient(
    circle,
    rgba(255, 245, 220, 0.4) 0%,
    transparent 70%
  );
  opacity: var(--accent-opacity, 0.03);
}

.ambient-accent--bottom-left {
  bottom: -5%;
  left: -5%;
  background: radial-gradient(
    circle,
    rgba(240, 230, 210, 0.3) 0%,
    transparent 70%
  );
  opacity: var(--accent-opacity, 0.02);
}

/* Breathing animation - slow and calming */
@keyframes breathe {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(var(--glow-scale, 1));
    opacity: var(--glow-opacity, 0.06);
  }
  50% {
    transform: translate(-50%, -50%) scale(calc(var(--glow-scale, 1) * 1.08));
    opacity: calc(var(--glow-opacity, 0.06) * 1.3);
  }
}

/* Dark theme - slightly more visible glow */
[data-theme="dark"] .ambient-orb--primary {
  opacity: calc(var(--glow-opacity, 0.06) * 1.5);
}

[data-theme="dark"] .ambient-orb--secondary {
  opacity: calc(var(--glow-opacity, 0.04) * 1.3);
}

[data-theme="dark"] .ambient-accent {
  opacity: calc(var(--accent-opacity, 0.03) * 1.4);
}

/* Light theme - very subtle */
[data-theme="light"] .ambient-orb {
  filter: blur(80px); /* More blur for softer effect */
}

[data-theme="light"] .ambient-accent--top-right {
  background: radial-gradient(
    circle,
    rgba(200, 180, 140, 0.2) 0%,
    transparent 70%
  );
}

[data-theme="light"] .ambient-accent--bottom-left {
  background: radial-gradient(
    circle,
    rgba(180, 160, 130, 0.15) 0%,
    transparent 70%
  );
}
</style>

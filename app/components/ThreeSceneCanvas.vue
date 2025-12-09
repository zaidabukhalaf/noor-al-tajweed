<script setup lang="ts">
/**
 * ThreeSceneCanvas.vue
 *
 * A respectful, subtle 3D visual layer that enhances the recitation experience.
 * Reacts to voice energy and tajwīd correctness without distracting from the Qur'an text.
 *
 * Design principles:
 * - Calm, meditative atmosphere
 * - Qur'an text remains the primary focus
 * - No aggressive or distracting effects
 * - Graceful performance degradation
 */

import * as THREE from "three";

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

// Canvas ref
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Three.js objects (kept outside reactive system for performance)
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let particles: THREE.Points | null = null;
let animationId: number | null = null;

// Particle system settings based on intensity
const particleSettings = computed(() => {
  switch (props.intensity) {
    case "off":
      return { count: 0, speed: 0, opacity: 0 };
    case "low":
      return { count: 50, speed: 0.0003, opacity: 0.3 };
    case "normal":
    default:
      return { count: 150, speed: 0.0005, opacity: 0.5 };
  }
});

// Color based on tajweed score (warm green for good, cool blue for needs improvement)
const sceneColor = computed(() => {
  const score = props.tajweedScore;
  // Interpolate between calm blue (low score) and warm golden-green (high score)
  const lowColor = new THREE.Color(0x1e3a5f); // Calm blue
  const highColor = new THREE.Color(0x4a7c59); // Warm green
  const color = lowColor.clone().lerp(highColor, score);
  return color;
});

/**
 * Initialize the Three.js scene
 */
function initScene() {
  if (!canvasRef.value || props.intensity === "off") return;

  const canvas = canvasRef.value;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // Scene
  scene = new THREE.Scene();
  scene.background = null; // Transparent to show CSS background

  // Camera
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.z = 30;

  // Renderer with alpha for transparency
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power", // Prefer battery life
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create particle system
  createParticles();

  // Start animation loop
  animate();

  // Handle resize
  window.addEventListener("resize", handleResize);
}

/**
 * Create the particle system
 */
function createParticles() {
  if (!scene) return;

  const { count } = particleSettings.value;
  if (count === 0) return;

  // Geometry
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // Random position in a sphere
    const radius = 25 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    // Random velocity
    velocities[i3] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

    // Random size
    sizes[i] = Math.random() * 2 + 1;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  // Material - soft glowing particles using generated texture
  const material = new THREE.PointsMaterial({
    size: 4, // Larger for soft glow
    color: sceneColor.value,
    transparent: true,
    opacity: particleSettings.value.opacity,
    map: getSoftParticleTexture(), // Use soft texture
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

/**
 * Generate a soft radial gradient texture programmatically
 * This removes the "square" look of default Three.js points
 */
function getSoftParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.5)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Animation loop
 *
 * IMPORTANT: The animation is ENERGY-DRIVEN:
 * - When energyLevel ≈ 0: particles are nearly still (very calm)
 * - When energyLevel is high: particles move faster, pulse, and glow
 */
function animate() {
  if (!scene || !camera || !renderer || !particles) {
    animationId = requestAnimationFrame(animate);
    return;
  }

  const { speed, opacity } = particleSettings.value;
  const energy = props.energyLevel;
  const time = Date.now() * 0.0005; // Time factor for sin waves

  // Get particle positions
  const positions = particles.geometry.attributes.position
    .array as Float32Array;
  const velocities = particles.geometry.attributes.velocity
    ?.array as Float32Array;

  // Access original positions if we want to reset/flow around a shape
  // For now, simpler flow:

  if (positions && velocities) {
    for (let i = 0; i < positions.length; i += 3) {
      // ENERGY-DRIVEN movement:
      // Base gentle flow + energy burst
      // Spiral flow:
      const x = positions[i];
      const z = positions[i + 2];
      const dist = Math.sqrt(x * x + z * z);

      // Rotate around Y axis
      const angleSpeed = (0.002 + energy * 0.01) * (15 / (dist + 0.1)); // Faster near center

      const cosA = Math.cos(angleSpeed);
      const sinA = Math.sin(angleSpeed);

      positions[i] = x * cosA - z * sinA;
      positions[i + 2] = x * sinA + z * cosA;

      // Gentle vertical wave
      positions[i + 1] +=
        Math.sin(time + dist * 0.5) * 0.02 + (Math.random() - 0.5) * 0.01;

      // Containment (pull back to center if too far)
      if (dist > 40) {
        positions[i] *= 0.99;
        positions[i + 2] *= 0.99;
      }
    }

    particles.geometry.attributes.position.needsUpdate = true;
  }

  // Update color based on tajweed score
  const material = particles.material as THREE.PointsMaterial;
  material.color.lerp(sceneColor.value, 0.05);

  // ENERGY-DRIVEN opacity:
  const baseOpacity = opacity * 0.4;
  const energyOpacity = energy * opacity * 2.0;
  material.opacity = Math.min(baseOpacity + energyOpacity, 0.9);

  // ENERGY-DRIVEN particle size:
  // Using material size for global scale
  const baseSize = 3;
  const energySize = energy * 6;
  material.size = baseSize + energySize;

  // Render
  renderer.render(scene, camera);

  animationId = requestAnimationFrame(animate);
}

/**
 * Handle window resize
 */
function handleResize() {
  if (!canvasRef.value || !camera || !renderer) return;

  const width = canvasRef.value.clientWidth;
  const height = canvasRef.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

/**
 * Clean up Three.js resources
 */
function cleanup() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  window.removeEventListener("resize", handleResize);

  if (particles) {
    particles.geometry.dispose();
    (particles.material as THREE.Material).dispose();
    particles = null;
  }

  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  if (scene) {
    scene.clear();
    scene = null;
  }

  camera = null;
}

// Watch for intensity changes
watch(
  () => props.intensity,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      cleanup();
      if (newVal !== "off") {
        nextTick(() => {
          initScene();
        });
      }
    }
  }
);

// Initialize on mount
onMounted(() => {
  if (props.intensity !== "off") {
    initScene();
  }
});

// Cleanup on unmount
onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div
    class="three-scene-container"
    :class="{
      'three-scene-container--active': isActive,
      'three-scene-container--contained': contained,
    }"
  >
    <!-- Fallback gradient background -->
    <div class="scene-gradient"></div>

    <!-- Three.js canvas -->
    <canvas
      ref="canvasRef"
      class="scene-canvas"
      v-if="intensity !== 'off'"
    ></canvas>

    <!-- Subtle radial glow that pulses with energy -->
    <div
      class="scene-glow"
      :style="{
        opacity: 0.2 + energyLevel * 0.3,
        transform: `scale(${1 + energyLevel * 0.1})`,
      }"
    ></div>
  </div>
</template>

<style scoped>
.three-scene-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
  transition: opacity var(--transition-slow);
  opacity: 0.6;
}

/* Contained mode - for preview boxes */
.three-scene-container--contained {
  position: absolute;
  z-index: 0;
  opacity: 1;
}

.three-scene-container--active {
  opacity: 1;
}

/* Fallback gradient for when Three.js is off or loading */
.scene-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    var(--bg-secondary) 0%,
    var(--bg-primary) 70%
  );
}

/* Three.js canvas */
.scene-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Radial glow effect */
.scene-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  height: 80%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    ellipse at center,
    rgba(74, 124, 89, 0.15) 0%,
    transparent 60%
  );
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Full-page mode glow uses viewport units */
.three-scene-container:not(.three-scene-container--contained) .scene-glow {
  width: 80vw;
  height: 80vh;
}

/* Dark theme adjustments */
[data-theme="dark"] .scene-gradient {
  background: radial-gradient(
    ellipse at center,
    var(--bg-card) 0%,
    var(--bg-primary) 70%
  );
}

[data-theme="dark"] .scene-glow {
  background: radial-gradient(
    ellipse at center,
    rgba(74, 139, 184, 0.1) 0%,
    transparent 60%
  );
}
</style>

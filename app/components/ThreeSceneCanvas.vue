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

  // Material - soft circular particles
  const material = new THREE.PointsMaterial({
    size: 2,
    color: sceneColor.value,
    transparent: true,
    opacity: particleSettings.value.opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
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

  // Get particle positions
  const positions = particles.geometry.attributes.position
    .array as Float32Array;
  const velocities = particles.geometry.attributes.velocity
    ?.array as Float32Array;

  if (positions && velocities) {
    for (let i = 0; i < positions.length; i += 3) {
      // ENERGY-DRIVEN movement:
      // - At energy = 0: multiplier = 0.05 (nearly still)
      // - At energy = 1: multiplier = 5 (very active)
      const movementMultiplier = 0.05 + energy * 5;

      positions[i] += velocities[i] * movementMultiplier;
      positions[i + 1] += velocities[i + 1] * movementMultiplier;
      positions[i + 2] += velocities[i + 2] * movementMultiplier;

      // ENERGY-DRIVEN orbit rotation:
      // - At energy = 0: barely rotates
      // - At energy = 1: rotates much faster
      const orbitSpeed = speed * (0.1 + energy * 3);
      const x = positions[i];
      const z = positions[i + 2];
      positions[i] = x * Math.cos(orbitSpeed) - z * Math.sin(orbitSpeed);
      positions[i + 2] = x * Math.sin(orbitSpeed) + z * Math.cos(orbitSpeed);
    }

    particles.geometry.attributes.position.needsUpdate = true;
  }

  // Update color based on tajweed score
  const material = particles.material as THREE.PointsMaterial;
  material.color.lerp(sceneColor.value, 0.05);

  // ENERGY-DRIVEN opacity:
  // - At energy = 0: base opacity (dim)
  // - At energy = 1: much brighter
  const baseOpacity = opacity * 0.3; // Start dimmer
  const energyOpacity = energy * opacity * 1.5;
  material.opacity = Math.min(baseOpacity + energyOpacity, 1);

  // ENERGY-DRIVEN particle size:
  // - Particles grow when there's voice energy
  const baseSize = 2;
  const energySize = energy * 4;
  material.size = baseSize + energySize;

  // ENERGY-DRIVEN rotation of entire particle system:
  // - At energy = 0: barely rotates
  // - At energy = 1: rotates noticeably
  particles.rotation.y += 0.0001 + energy * 0.003;

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

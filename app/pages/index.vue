<script setup lang="ts">
/**
 * Home Page - Polished Landing
 *
 * A calm, spiritual landing page that invites users to
 * begin their Qur'an recitation journey with Noor Tajweed.
 */

import type { ModeOption, RecitationMode } from "~/types";

const { t, settings, updateSetting } = useAppSettings();
const router = useRouter();

// Mode options with enhanced styling
const modes = computed<ModeOption[]>(() => [
  {
    id: "free",
    title: "Free Recitation",
    titleAr: "تلاوة حرة",
    description: "Recite any surah at your own pace with gentle feedback",
    descriptionAr: "اقرأ أي سورة بالسرعة التي تناسبك مع ملاحظات لطيفة",
    icon: "🎙️",
    color: "var(--color-primary)",
  },
  {
    id: "practice",
    title: "Practice Mode",
    titleAr: "وضع التدريب",
    description: "Focus on specific tajwīd rules: ghunnah, madd, and more",
    descriptionAr: "ركز على قواعد تجويد محددة: الغنة، المد، وغيرها",
    icon: "📖",
    color: "var(--color-accent)",
  },
  {
    id: "kids",
    title: "Kids Mode",
    titleAr: "وضع الأطفال",
    description: "Friendly interface with larger text and joyful feedback",
    descriptionAr: "واجهة صديقة للأطفال مع نص كبير وملاحظات مشجعة",
    icon: "🌟",
    color: "var(--color-secondary)",
  },
]);

// "How it works" steps
const steps = computed(() => [
  {
    icon: "📖",
    title: t("اختر الآيات", "Choose Ayat"),
    description: t(
      "اختر السورة والآيات التي تريد تلاوتها",
      "Select the surah and verses you want to recite"
    ),
  },
  {
    icon: "🎤",
    title: t("ابدأ التلاوة", "Start Reciting"),
    description: t(
      "اقرأ بصوت واضح وسيتابعك النظام كلمة بكلمة",
      "Read clearly and the system will follow you word by word"
    ),
  },
  {
    icon: "✨",
    title: t("احصل على الملاحظات", "Get Feedback"),
    description: t(
      "تلقَّ ملاحظات لطيفة على أدائك مع تحسينات مقترحة",
      "Receive gentle feedback on your performance with suggestions"
    ),
  },
]);

// Handle mode selection
function selectMode(mode: RecitationMode) {
  if (mode === "kids") {
    // Enable kids mode in settings
    updateSetting("kidsMode", true);
  }
  router.push({ path: "/recite", query: { mode } });
}

// Quick start with Al-Fatihah
function quickStart() {
  router.push("/recite?surah=1");
}

// SEO
useHead({
  title: t("نور التجويد - الرئيسية", "Noor Tajweed - Home"),
  meta: [
    {
      name: "description",
      content: t(
        "تعلم تلاوة القرآن الكريم مع ملاحظات ذكية وتفاعلية على التجويد",
        "Learn Qur'anic recitation with intelligent, interactive tajwīd feedback"
      ),
    },
  ],
});
</script>

<template>
  <div class="home">
    <!-- Background Visual -->

    <!-- Hero Section -->
    <section class="hero">
      <!-- Animated Background -->
      <div class="hero-bg">
        <!-- Gradient Overlay -->
        <div class="hero-gradient"></div>

        <!-- Celestial Orb - The "Noor" (Light) -->
        <div class="celestial-orb">
          <div class="orb-core"></div>
          <div class="orb-glow"></div>
          <div class="orb-ring orb-ring--1"></div>
          <div class="orb-ring orb-ring--2"></div>
          <div class="orb-ring orb-ring--3"></div>
          <div class="orb-ring orb-ring--4"></div>
        </div>

        <!-- Flowing Lines -->
        <svg
          class="flow-lines"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(212, 175, 55, 0)" />
              <stop offset="50%" stop-color="rgba(212, 175, 55, 0.4)" />
              <stop offset="100%" stop-color="rgba(212, 175, 55, 0)" />
            </linearGradient>
            <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="rgba(74, 124, 89, 0)" />
              <stop offset="50%" stop-color="rgba(74, 124, 89, 0.3)" />
              <stop offset="100%" stop-color="rgba(74, 124, 89, 0)" />
            </linearGradient>
          </defs>
          <path
            class="flow-path flow-path--1"
            d="M-100,400 Q300,200 600,400 T1300,400"
            stroke="url(#lineGrad1)"
          />
          <path
            class="flow-path flow-path--2"
            d="M-100,450 Q300,250 600,450 T1300,450"
            stroke="url(#lineGrad1)"
          />
          <path
            class="flow-path flow-path--3"
            d="M-100,350 Q300,150 600,350 T1300,350"
            stroke="url(#lineGrad2)"
          />
          <path
            class="flow-path flow-path--4"
            d="M1300,300 Q900,500 600,300 T-100,300"
            stroke="url(#lineGrad2)"
          />
        </svg>

        <!-- Floating Particles -->
        <div class="particles">
          <div class="particle particle--1"></div>
          <div class="particle particle--2"></div>
          <div class="particle particle--3"></div>
          <div class="particle particle--4"></div>
          <div class="particle particle--5"></div>
          <div class="particle particle--6"></div>
          <div class="particle particle--7"></div>
          <div class="particle particle--8"></div>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="hero-content">
        <!-- Decorative Stars -->
        <div class="stars-decoration">✦ ✦ ✦</div>

        <!-- Main Title -->
        <h1 class="hero-title">
          <span class="title-ar">نور التجويد</span>
          <span class="title-en">Noor Tajweed</span>
        </h1>

        <!-- Tagline -->
        <p class="hero-tagline">
          {{
            t(
              "تعلم تلاوة القرآن الكريم مع ملاحظات ذكية ولطيفة",
              "Train your Qur'an recitation with gentle, AI-assisted feedback"
            )
          }}
        </p>

        <!-- CTA Buttons -->
        <div class="hero-actions">
          <button class="btn-hero btn-hero--primary" @click="quickStart">
            <span class="btn-hero-icon">▶</span>
            {{ t("ابدأ التلاوة", "Start Reciting") }}
          </button>
          <NuxtLink to="/recite?mode=practice" class="btn-hero btn-hero--ghost">
            {{ t("وضع التدريب", "Practice Mode") }}
          </NuxtLink>
        </div>

        <!-- Trust Badge -->
        <p class="hero-badge">
          <span class="badge-icon">🔒</span>
          {{
            t(
              "خصوصية كاملة - صوتك لا يُسجَّل أبداً",
              "Complete privacy - your voice is never recorded"
            )
          }}
        </p>
      </div>
    </section>

    <!-- Mode Selection -->
    <section class="modes-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            {{ t("اختر طريقة التلاوة", "Choose Your Path") }}
          </h2>
          <p class="section-subtitle">
            {{
              t(
                "ثلاث طرق مصممة لتناسب احتياجاتك",
                "Three modes designed to fit your needs"
              )
            }}
          </p>
        </div>

        <div class="modes-grid">
          <button
            v-for="mode in modes"
            :key="mode.id"
            class="mode-card"
            :class="`mode-card--${mode.id}`"
            :style="{ '--mode-color': mode.color }"
            @click="selectMode(mode.id)"
          >
            <div class="mode-card-inner">
              <span class="mode-icon">{{ mode.icon }}</span>
              <h3 class="mode-title">
                {{ settings.language === "ar" ? mode.titleAr : mode.title }}
              </h3>
              <p class="mode-description">
                {{
                  settings.language === "ar"
                    ? mode.descriptionAr
                    : mode.description
                }}
              </p>
              <span class="mode-arrow">←</span>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            {{ t("كيف يعمل؟", "How It Works") }}
          </h2>
        </div>

        <div class="steps-grid">
          <div v-for="(step, index) in steps" :key="index" class="step-item">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-icon">{{ step.icon }}</div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h4 class="feature-title">
              {{ t("خصوصية كاملة", "Complete Privacy") }}
            </h4>
            <p class="feature-text">
              {{
                t(
                  "صوتك لا يُسجَّل ولا يُحفَظ أبداً",
                  "Your voice is never recorded or stored"
                )
              }}
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h4 class="feature-title">
              {{ t("يعمل في كل مكان", "Works Everywhere") }}
            </h4>
            <p class="feature-text">
              {{
                t(
                  "على الهاتف والحاسوب بدون تثبيت",
                  "On phone and desktop, no installation required"
                )
              }}
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🌙</div>
            <h4 class="feature-title">
              {{ t("الوضع الليلي", "Night Mode") }}
            </h4>
            <p class="feature-text">
              {{ t("مريح للعين في أي وقت", "Easy on the eyes, anytime") }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="cta-section">
      <div class="container container--narrow">
        <div class="cta-card">
          <p class="cta-verse quran-text">
            ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
          </p>
          <p class="cta-translation">
            {{
              t(
                '"ورتل القرآن ترتيلاً" - سورة المزمل',
                '"And recite the Qur\'an with measured recitation" - Surah Al-Muzzammil'
              )
            }}
          </p>
          <NuxtLink to="/recite" class="btn btn--secondary btn--lg">
            {{ t("ابدأ رحلتك", "Begin Your Journey") }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    #0a0f1a 0%,
    #0f1419 50%,
    var(--bg-primary) 100%
  );
}

/* ==========================================
   Hero Section - Stunning Visual Design
   ========================================== */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-4);
  text-align: center;
  overflow: hidden;
}

/* Hero Background Container */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

/* Gradient Overlay */
.hero-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      ellipse 80% 60% at 50% 40%,
      rgba(212, 175, 55, 0.08) 0%,
      transparent 60%
    ),
    radial-gradient(
      ellipse 100% 100% at 50% 100%,
      rgba(30, 58, 95, 0.15) 0%,
      transparent 50%
    );
}

/* ==========================================
   Celestial Orb - The "Noor" (Light)
   ========================================== */
.celestial-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
}

.orb-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #d4af37 0%, #b8860b 50%, #8b6914 100%);
  border-radius: 50%;
  box-shadow: 0 0 40px 10px rgba(212, 175, 55, 0.3);
}

.orb-core::after {
  content: "";
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.4) 0%,
    transparent 70%
  );
  will-change: transform, opacity;
  animation: pulseScale 4s ease-in-out infinite;
  z-index: -1;
}

.orb-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
  will-change: transform, opacity;
  animation: glowPulse 4s ease-in-out infinite;
}

/* Orbiting Rings */
.orb-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 1px solid;
  transform: translate(-50%, -50%);
}

.orb-ring--1 {
  width: 100px;
  height: 100px;
  border-color: rgba(212, 175, 55, 0.4);
  animation: ringRotate 20s linear infinite;
}

.orb-ring--2 {
  width: 160px;
  height: 160px;
  border-color: rgba(212, 175, 55, 0.25);
  animation: ringRotate 30s linear infinite reverse;
}

.orb-ring--3 {
  width: 220px;
  height: 220px;
  border-color: rgba(74, 124, 89, 0.2);
  animation: ringRotate 40s linear infinite;
}

.orb-ring--4 {
  width: 280px;
  height: 280px;
  border-color: rgba(74, 124, 89, 0.1);
  animation: ringRotate 50s linear infinite reverse;
}

/* ==========================================
   Flowing Lines (SVG)
   ========================================== */
.flow-lines {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.flow-path {
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: flowDraw 8s ease-in-out infinite;
}

.flow-path--1 {
  animation-delay: 0s;
}
.flow-path--2 {
  animation-delay: 1s;
}
.flow-path--3 {
  animation-delay: 2s;
}
.flow-path--4 {
  animation-delay: 3s;
}

/* ==========================================
   Floating Particles
   ========================================== */
.particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(212, 175, 55, 0.6);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
  animation: particleFloat 10s ease-in-out infinite;
}

.particle--1 {
  top: 20%;
  left: 15%;
  animation-delay: 0s;
  animation-duration: 12s;
}
.particle--2 {
  top: 30%;
  left: 80%;
  animation-delay: 1s;
  animation-duration: 14s;
}
.particle--3 {
  top: 60%;
  left: 10%;
  animation-delay: 2s;
  animation-duration: 11s;
}
.particle--4 {
  top: 70%;
  left: 85%;
  animation-delay: 3s;
  animation-duration: 13s;
}
.particle--5 {
  top: 15%;
  left: 60%;
  animation-delay: 4s;
  animation-duration: 15s;
  width: 3px;
  height: 3px;
}
.particle--6 {
  top: 80%;
  left: 40%;
  animation-delay: 5s;
  animation-duration: 10s;
  width: 5px;
  height: 5px;
}
.particle--7 {
  top: 40%;
  left: 25%;
  animation-delay: 6s;
  animation-duration: 16s;
  width: 3px;
  height: 3px;
}
.particle--8 {
  top: 50%;
  left: 70%;
  animation-delay: 7s;
  animation-duration: 12s;
}

/* ==========================================
   Hero Content
   ========================================== */
.hero-content {
  position: relative;
  z-index: 10;
  max-width: 700px;
  animation: fadeInUp 1s ease-out;
}

.stars-decoration {
  font-size: var(--text-sm);
  color: rgba(212, 175, 55, 0.6);
  letter-spacing: 0.5em;
  margin-bottom: var(--space-6);
  animation: twinkle 3s ease-in-out infinite;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  position: relative;
  z-index: 20;
}

.title-ar {
  font-family: var(--font-quran);
  font-size: clamp(3rem, 10vw, 5rem);
  font-weight: 400;
  color: #ffffff;
  line-height: 1.1;
  text-shadow: 0 0 60px rgba(212, 175, 55, 0.3);
}

.title-en {
  font-size: var(--text-lg);
  font-weight: 500;
  color: #fff;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  opacity: 0.9;
}

.hero-tagline {
  font-size: var(--text-xl);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-10);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

/* Hero Buttons */
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.btn-hero {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
  font-weight: 600;
  border-radius: var(--border-radius-full);
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
}

.btn-hero--primary {
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: #0a0f1a;
  border: none;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
}

.btn-hero--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.5);
}

.btn-hero--ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-hero--ghost:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-hero-icon {
  font-size: var(--text-base);
}

/* Trust Badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.5);
}

.badge-icon {
  font-size: var(--text-sm);
}

/* ==========================================
   Animations
   ========================================== */
@keyframes pulseScale {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

@keyframes ringRotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes flowDraw {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  50% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: -1000;
    opacity: 0;
  }
}

@keyframes particleFloat {
  0%,
  100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-20px) translateX(10px) scale(1.2);
    opacity: 1;
  }
  50% {
    transform: translateY(-10px) translateX(-10px) scale(0.8);
    opacity: 0.8;
  }
  75% {
    transform: translateY(-30px) translateX(5px) scale(1.1);
    opacity: 0.9;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* ==========================================
   Section Common
   ========================================== */
.section-header {
  text-align: center;
  margin-bottom: var(--space-10);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.section-subtitle {
  font-size: var(--text-lg);
  color: var(--text-muted);
}

/* ==========================================
   Mode Selection
   ========================================== */
.modes-section {
  padding: var(--space-16) 0;
  background: var(--bg-secondary);
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.mode-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: 0;
  cursor: pointer;
  text-align: start;
  overflow: hidden;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
}

.mode-card:hover {
  transform: translateY(-4px);
  border-color: var(--mode-color);
  box-shadow: 0 12px 40px -8px rgba(0, 0, 0, 0.15);
}

.mode-card:hover .mode-arrow {
  transform: translateX(-4px);
  opacity: 1;
}

.mode-card-inner {
  padding: var(--space-8);
}

.mode-icon {
  display: block;
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

.mode-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--mode-color);
  margin-bottom: var(--space-2);
}

.mode-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

.mode-arrow {
  position: absolute;
  top: var(--space-6);
  left: var(--space-6);
  font-size: var(--text-xl);
  color: var(--mode-color);
  opacity: 0;
  transition: all var(--transition-fast);
}

[dir="ltr"] .mode-arrow {
  left: auto;
  right: var(--space-6);
  transform: rotate(180deg);
}

/* ==========================================
   How It Works
   ========================================== */
.how-section {
  padding: var(--space-16) 0;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-8);
}

.step-item {
  position: relative;
  text-align: center;
  padding: var(--space-6);
}

.step-number {
  position: absolute;
  top: 0;
  right: 50%;
  transform: translateX(50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #fff;
  font-weight: 700;
  font-size: var(--text-sm);
  border-radius: 50%;
  box-shadow: var(--shadow-md);
}

.step-icon {
  display: block;
  font-size: 3rem;
  margin-top: var(--space-6);
  margin-bottom: var(--space-4);
}

.step-title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.step-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* ==========================================
   Features
   ========================================== */
.features-section {
  padding: var(--space-12) 0;
  background: var(--bg-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-6);
}

.feature-card {
  text-align: center;
  padding: var(--space-6);
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: var(--space-3);
}

.feature-title {
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.feature-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* ==========================================
   CTA Section
   ========================================== */
.cta-section {
  padding: var(--space-16) 0;
  background: #0a0f1a;
}

.cta-card {
  text-align: center;
  padding: var(--space-12);
  background: linear-gradient(
    135deg,
    rgba(212, 175, 55, 0.15),
    rgba(212, 175, 55, 0.05)
  );
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: var(--border-radius-xl);
  color: white;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
}

.cta-verse {
  font-size: var(--text-3xl);
  font-family: var(--font-quran);
  color: #d4af37 !important;
  margin-bottom: var(--space-4);
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.cta-translation {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: var(--space-6);
}

.cta-card .btn--secondary {
  background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
  color: #000;
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.cta-card .btn--secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
}

/* ==========================================
   Responsive
   ========================================== */
@media (max-width: 768px) {
  .hero {
    min-height: auto;
    padding: var(--space-12) var(--space-4);
  }

  .hero-logo {
    width: 64px;
    height: 64px;
  }

  .logo-icon {
    font-size: 2rem;
  }

  .title-ar {
    font-size: 2.5rem;
  }

  .hero-tagline {
    font-size: var(--text-lg);
  }

  .section-title {
    font-size: var(--text-2xl);
  }

  .modes-grid,
  .steps-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-verse {
    font-size: var(--text-2xl);
  }
}
</style>

<script setup lang="ts">
/**
 * Home Page (page.vue)
 *
 * Landing page with mode selection.
 * Users can choose between Free Recitation, Practice Mode, or Kids Mode.
 */

import type { ModeOption, RecitationMode } from "~/types";

const { t, settings } = useAppSettings();
const router = useRouter();

// Mode options
const modes = computed<ModeOption[]>(() => [
  {
    id: "free",
    title: "Free Recitation",
    titleAr: "تلاوة حرة",
    description: "Choose any surah and recite at your own pace",
    descriptionAr: "اختر أي سورة وتلو بالسرعة التي تناسبك",
    icon: "🎙️",
    color: "var(--color-primary)",
  },
  {
    id: "practice",
    title: "Practice Mode",
    titleAr: "وضع التدريب",
    description: "Focus on specific tajwīd rules like ghunnah or madd",
    descriptionAr: "ركز على قواعد تجويد محددة مثل الغنة أو المد",
    icon: "📖",
    color: "var(--color-accent)",
  },
  {
    id: "kids",
    title: "Kids Mode",
    titleAr: "وضع الأطفال",
    description: "Larger text, playful visuals, and simpler feedback",
    descriptionAr: "نص أكبر، رسومات ممتعة، وملاحظات مبسطة",
    icon: "👶",
    color: "var(--color-secondary)",
  },
]);

// Handle mode selection
function selectMode(mode: RecitationMode) {
  // Navigate to recite page with mode query param
  router.push({ path: "/recite", query: { mode } });
}

// SEO
useHead({
  title: t("نور التجويد - الرئيسية", "Noor Tajweed - Home"),
});
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content animate-fade-in">
        <div class="hero-icon">🌙</div>
        <h1 class="hero-title">
          {{ t("نور التجويد", "Noor Tajweed") }}
        </h1>
        <p class="hero-subtitle">
          {{
            t(
              "تعلم تجويد القرآن الكريم بطريقة تفاعلية وممتعة",
              "Learn Qur'anic recitation with interactive tajwīd feedback"
            )
          }}
        </p>
      </div>
    </section>

    <!-- Mode Selection -->
    <section class="modes-section">
      <div class="container">
        <h2 class="section-title">
          {{ t("اختر طريقة التلاوة", "Choose Recitation Mode") }}
        </h2>

        <div class="modes-grid">
          <button
            v-for="mode in modes"
            :key="mode.id"
            class="mode-card card card--interactive card--mode"
            :style="{ '--mode-color': mode.color }"
            @click="selectMode(mode.id)"
          >
            <span class="card-icon">{{ mode.icon }}</span>
            <h3 class="card-title">
              {{ settings.language === "ar" ? mode.titleAr : mode.title }}
            </h3>
            <p class="card-description">
              {{
                settings.language === "ar"
                  ? mode.descriptionAr
                  : mode.description
              }}
            </p>
          </button>
        </div>
      </div>
    </section>

    <!-- Quick Start Section -->
    <section class="quick-start">
      <div class="container container--narrow">
        <div class="quick-start-card card">
          <h3 class="quick-start-title">
            {{ t("ابدأ بسورة الفاتحة", "Start with Al-Fatihah") }}
          </h3>
          <p class="quick-start-text">
            {{
              t(
                "أفضل طريقة للبدء هي بتلاوة سورة الفاتحة. اضغط على الزر أدناه للبدء.",
                "The best way to start is by reciting Surah Al-Fatihah. Click the button below to begin."
              )
            }}
          </p>
          <NuxtLink to="/recite?surah=1" class="btn btn--primary btn--lg">
            {{ t("ابدأ الآن", "Start Now") }}
            ▶️
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Features Preview -->
    <section class="features">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-icon">✨</span>
            <h4 class="feature-title">
              {{ t("تتبع مباشر", "Real-time Tracking") }}
            </h4>
            <p class="feature-text">
              {{
                t(
                  "تتبع تلاوتك كلمة بكلمة مع ملاحظات فورية",
                  "Track your recitation word by word with instant feedback"
                )
              }}
            </p>
          </div>

          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <h4 class="feature-title">
              {{ t("قواعد التجويد", "Tajwīd Rules") }}
            </h4>
            <p class="feature-text">
              {{
                t(
                  "تعلم الغنة، المد، الإخفاء، والمزيد",
                  "Learn ghunnah, madd, ikhfā', and more"
                )
              }}
            </p>
          </div>

          <div class="feature-item">
            <span class="feature-icon">📊</span>
            <h4 class="feature-title">
              {{ t("تتبع التقدم", "Track Progress") }}
            </h4>
            <p class="feature-text">
              {{
                t("راقب تحسنك عبر الوقت", "Monitor your improvement over time")
              }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: 100%;
}

/* Hero Section */
.hero {
  text-align: center;
  padding: var(--space-12) var(--space-4);
  background: linear-gradient(
    135deg,
    var(--bg-secondary) 0%,
    var(--bg-primary) 100%
  );
  border-bottom: 1px solid var(--border-color);
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
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

.hero-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-4);
}

.hero-subtitle {
  font-size: var(--text-xl);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

/* Modes Section */
.modes-section {
  padding: var(--space-12) 0;
}

.section-title {
  text-align: center;
  font-size: var(--text-2xl);
  margin-bottom: var(--space-8);
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.mode-card {
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.mode-card:hover {
  border-color: var(--mode-color);
}

.mode-card .card-icon {
  font-size: 3.5rem;
}

.mode-card .card-title {
  color: var(--mode-color);
}

/* Quick Start */
.quick-start {
  padding: var(--space-8) 0;
  background-color: var(--bg-secondary);
}

.quick-start-card {
  text-align: center;
  padding: var(--space-8);
}

.quick-start-title {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-4);
}

.quick-start-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

/* Features */
.features {
  padding: var(--space-12) 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-8);
}

.feature-item {
  text-align: center;
}

.feature-icon {
  display: block;
  font-size: 2.5rem;
  margin-bottom: var(--space-4);
}

.feature-title {
  font-size: var(--text-lg);
  margin-bottom: var(--space-2);
}

.feature-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: var(--space-8) var(--space-4);
  }

  .hero-title {
    font-size: var(--text-3xl);
  }

  .hero-subtitle {
    font-size: var(--text-lg);
  }

  .modes-section,
  .features {
    padding: var(--space-8) 0;
  }
}
</style>

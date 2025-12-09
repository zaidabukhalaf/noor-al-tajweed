<script setup lang="ts">
/**
 * Progress Page (/progress/page.vue)
 *
 * Shows recitation history and progress tracking.
 * Displays past sessions with scores and breakdown.
 */

import type { SessionSummary } from "~/types";

const { t, settings } = useAppSettings();

// Mock session history for Phase 1
// In Phase 4, this will load from localStorage/IndexedDB
const sessions = ref<SessionSummary[]>([
  {
    id: "1",
    timestamp: new Date(Date.now() - 86400000), // Yesterday
    surahNumber: 1,
    surahName: "الفاتحة",
    ayahRange: [1, 7],
    totalWords: 29,
    correctCount: 25,
    warningCount: 3,
    errorCount: 1,
    ruleBreakdown: {} as any,
    overallScore: 86,
    duration: 45000,
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    surahNumber: 112,
    surahName: "الإخلاص",
    ayahRange: [1, 4],
    totalWords: 15,
    correctCount: 14,
    warningCount: 1,
    errorCount: 0,
    ruleBreakdown: {} as any,
    overallScore: 93,
    duration: 30000,
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 259200000), // 3 days ago
    surahNumber: 114,
    surahName: "الناس",
    ayahRange: [1, 6],
    totalWords: 20,
    correctCount: 16,
    warningCount: 2,
    errorCount: 2,
    ruleBreakdown: {} as any,
    overallScore: 80,
    duration: 40000,
  },
]);

// Format date
function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    return settings.value.language === "ar" ? "اليوم" : "Today";
  }
  if (days === 1) {
    return settings.value.language === "ar" ? "أمس" : "Yesterday";
  }
  if (days < 7) {
    return settings.value.language === "ar"
      ? `منذ ${days} أيام`
      : `${days} days ago`;
  }

  return date.toLocaleDateString(
    settings.value.language === "ar" ? "ar" : "en",
    { month: "short", day: "numeric" }
  );
}

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

// Get score color
function getScoreColor(score: number): string {
  if (score >= 80) return "var(--highlight-correct)";
  if (score >= 60) return "var(--highlight-warning)";
  return "var(--highlight-error)";
}

// Calculate overall stats
const overallStats = computed(() => {
  const total = sessions.value.length;
  if (total === 0) return null;

  const avgScore = Math.round(
    sessions.value.reduce((acc, s) => acc + s.overallScore, 0) / total
  );
  const totalWords = sessions.value.reduce((acc, s) => acc + s.totalWords, 0);
  const totalCorrect = sessions.value.reduce(
    (acc, s) => acc + s.correctCount,
    0
  );

  return {
    totalSessions: total,
    avgScore,
    totalWords,
    totalCorrect,
    accuracy: Math.round((totalCorrect / totalWords) * 100),
  };
});

// SEO
useHead({
  title: t("نور التجويد - التقدم", "Noor Tajweed - Progress"),
});
</script>

<template>
  <div
    class="progress-page container"
    :class="{ 'progress-page--kids': settings.kidsMode }"
  >
    <header class="progress-header">
      <h1 class="page-title">
        {{ t("سجل التلاوات", "Recitation History") }}
      </h1>
      <p class="page-subtitle">
        {{
          t(
            "تتبع تقدمك وتحسنك في التلاوة",
            "Track your progress and improvement over time"
          )
        }}
      </p>
    </header>

    <!-- Overall Stats -->
    <section v-if="overallStats" class="stats-overview">
      <div class="stats-grid">
        <!-- Average Score Card (Featured) -->
        <div class="stat-card stat-card--featured">
          <div class="circular-chart-wrapper">
            <svg viewBox="0 0 36 36" class="circular-chart">
              <path
                class="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="circle"
                :stroke-dasharray="overallStats.avgScore + ', 100'"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                :style="{ stroke: getScoreColor(overallStats.avgScore) }"
              />
            </svg>
            <div class="circular-text">
              <span class="circular-value">{{ overallStats.avgScore }}%</span>
              <span class="circular-label">{{
                t("متوسط الدرجة", "Avg Score")
              }}</span>
            </div>
          </div>
        </div>

        <!-- Metric Cards -->
        <div class="stats-metrics-col">
          <div class="stat-card">
            <div class="stat-icon-bg">📊</div>
            <div class="stat-content">
              <span class="stat-value">{{ overallStats.totalSessions }}</span>
              <span class="stat-label">{{ t("جلسة", "Sessions") }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-bg">📖</div>
            <div class="stat-content">
              <span class="stat-value">{{ overallStats.totalWords }}</span>
              <span class="stat-label">{{ t("كلمة", "Words") }}</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-bg">✅</div>
            <div class="stat-content">
              <span class="stat-value" style="color: var(--highlight-correct)">
                {{ overallStats.accuracy }}%
              </span>
              <span class="stat-label">{{ t("الدقة", "Accuracy") }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sessions List -->
    <section class="sessions-section">
      <h2 class="section-title">
        {{ t("الجلسات السابقة", "Past Sessions") }}
      </h2>

      <!-- Empty State -->
      <div v-if="sessions.length === 0" class="empty-state">
        <span class="empty-icon">📋</span>
        <h3 class="empty-title">
          {{ t("لا توجد جلسات", "No sessions yet") }}
        </h3>
        <p class="empty-text">
          {{
            t(
              "ابدأ تلاوتك الأولى لتظهر هنا",
              "Start your first recitation to see it here"
            )
          }}
        </p>
        <NuxtLink to="/recite" class="btn btn--primary">
          {{ t("ابدأ التلاوة", "Start Reciting") }}
        </NuxtLink>
      </div>

      <!-- Sessions Grid -->
      <div v-else class="sessions-list">
        <article
          v-for="(session, index) in sessions"
          :key="session.id"
          class="session-card card"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <div class="session-header">
            <div class="session-info">
              <span class="session-date">
                {{ formatDate(session.timestamp) }}
              </span>
              <div class="session-surah">
                <span class="surah-name">سورة {{ session.surahName }}</span>
                <span class="ayah-range">
                  {{ t("الآيات", "Ayat") }} {{ session.ayahRange[0] }}-{{
                    session.ayahRange[1]
                  }}
                </span>
              </div>
            </div>
            <div class="session-meta">
              <div
                class="score-badge"
                :style="{
                  backgroundColor: getScoreColor(session.overallScore),
                  color: '#fff',
                }"
              >
                {{ session.overallScore }}%
              </div>
            </div>
          </div>

          <div class="session-stats-row">
            <span class="stat-pill stat-pill--correct">
              ✅ {{ session.correctCount }}
            </span>
            <span class="stat-pill stat-pill--warning">
              ⚠️ {{ session.warningCount }}
            </span>
            <span class="stat-pill stat-pill--error">
              ❌ {{ session.errorCount }}
            </span>
            <span class="stat-pill stat-pill--time">
              ⏱️ {{ formatDuration(session.duration) }}
            </span>
          </div>

          <div class="session-actions">
            <NuxtLink
              :to="`/recite?surah=${session.surahNumber}`"
              class="btn btn--ghost btn--sm btn--full-width"
            >
              {{ t("إعادة التلاوة", "Recite Again") }}
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.progress-page {
  padding-top: var(--space-8);
  padding-bottom: var(--space-12);
}

.progress-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-2);
}

.page-subtitle {
  color: var(--text-muted);
  font-size: var(--text-lg);
}

/* Stats Overview */
.stats-overview {
  margin-bottom: var(--space-12);
}

.stats-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-6);
}

/* Circular Chart Card */
.stat-card--featured {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: var(--space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.circular-chart-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
}

.circular-chart {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  max-height: 100%;
}

.circle-bg {
  fill: none;
  stroke: var(--bg-tertiary);
  stroke-width: 2.5;
}

.circle {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
}

@keyframes progress {
  0% {
    stroke-dasharray: 0 100;
  }
}

.circular-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.circular-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.circular-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: var(--space-1);
}

/* Metrics Column */
.stats-metrics-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.stat-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon-bg {
  width: 40px;
  height: 40px;
  background: var(--bg-tertiary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: var(--space-3);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: var(--space-1);
}

/* Sessions Section */
.sessions-section {
  max-width: 800px;
  margin: 0 auto;
}

.section-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--border-color);
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.session-card {
  padding: var(--space-5);
  border-left: 4px solid transparent; /* Status indicator placeholder */
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.session-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: block;
  margin-bottom: var(--space-1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.session-surah {
  display: flex;
  flex-direction: column;
}

.surah-name {
  font-weight: 700;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.ayah-range {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.score-badge {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--border-radius-lg);
  font-weight: 700;
  font-size: var(--text-lg);
  min-width: 60px;
  text-align: center;
}

.session-stats-row {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-4);
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-full);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.session-actions {
  border-top: 1px solid var(--border-color);
  padding-top: var(--space-3);
}

.btn--full-width {
  width: 100%;
  justify-content: center;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-12);
  background-color: var(--bg-card);
  border-radius: var(--border-radius-xl);
  border: 1px dashed var(--border-color);
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: var(--space-4);
  opacity: 0.3;
}

.empty-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
}

.empty-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

/* Kids Mode Overrides */
.progress-page--kids {
  --color-primary: #8e44ad;
  --bg-card: #fff;
}

.progress-page--kids .page-title {
  color: #d35400;
  font-weight: 800;
}

.progress-page--kids .stat-card {
  border: 2px solid #f1c40f;
  box-shadow: 0 4px 8px rgba(241, 196, 15, 0.2);
}

.progress-page--kids .score-badge {
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stats-metrics-col {
    grid-template-columns: repeat(3, 1fr);
  }

  .circular-chart-wrapper {
    width: 140px;
    height: 140px;
  }

  .circular-value {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .stats-metrics-col {
    grid-template-columns: 1fr;
  }
}
</style>

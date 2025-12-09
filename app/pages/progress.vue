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
  <div class="progress-page container">
    <h1 class="page-title">
      {{ t("سجل التلاوات", "Recitation History") }}
    </h1>

    <!-- Overall Stats -->
    <section v-if="overallStats" class="stats-overview">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">📊</span>
          <span class="stat-value">{{ overallStats.totalSessions }}</span>
          <span class="stat-label">{{ t("جلسة", "Sessions") }}</span>
        </div>

        <div class="stat-card">
          <span class="stat-icon">🎯</span>
          <span
            class="stat-value"
            :style="{ color: getScoreColor(overallStats.avgScore) }"
          >
            {{ overallStats.avgScore }}%
          </span>
          <span class="stat-label">{{ t("متوسط الدرجة", "Avg Score") }}</span>
        </div>

        <div class="stat-card">
          <span class="stat-icon">📖</span>
          <span class="stat-value">{{ overallStats.totalWords }}</span>
          <span class="stat-label">{{ t("كلمة", "Words") }}</span>
        </div>

        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <span class="stat-value" style="color: var(--highlight-correct)">
            {{ overallStats.accuracy }}%
          </span>
          <span class="stat-label">{{ t("الدقة", "Accuracy") }}</span>
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
          v-for="session in sessions"
          :key="session.id"
          class="session-card card"
        >
          <div class="session-header">
            <div class="session-surah">
              <span class="surah-name">سورة {{ session.surahName }}</span>
              <span class="ayah-range">
                {{ t("الآيات", "Ayat") }} {{ session.ayahRange[0] }}-{{
                  session.ayahRange[1]
                }}
              </span>
            </div>
            <div
              class="session-score"
              :style="{ color: getScoreColor(session.overallScore) }"
            >
              {{ session.overallScore }}%
            </div>
          </div>

          <div class="session-stats">
            <span class="stat-mini"> ✅ {{ session.correctCount }} </span>
            <span class="stat-mini stat-mini--warning">
              ⚠️ {{ session.warningCount }}
            </span>
            <span class="stat-mini stat-mini--error">
              ❌ {{ session.errorCount }}
            </span>
            <span class="stat-mini">
              ⏱️ {{ formatDuration(session.duration) }}
            </span>
          </div>

          <div class="session-footer">
            <span class="session-date">
              {{ formatDate(session.timestamp) }}
            </span>
            <NuxtLink
              :to="`/recite?surah=${session.surahNumber}`"
              class="btn btn--ghost btn--sm"
            >
              {{ t("إعادة", "Retry") }}
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>

    <!-- Coming Soon Notice -->
    <section class="coming-soon">
      <div class="coming-soon-card card">
        <span class="coming-soon-icon">🚀</span>
        <h3 class="coming-soon-title">
          {{ t("قريباً", "Coming Soon") }}
        </h3>
        <p class="coming-soon-text">
          {{
            t(
              "رسوم بيانية للتقدم، إنجازات، وإحصائيات مفصلة",
              "Progress charts, achievements, and detailed statistics"
            )
          }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.progress-page {
  padding-top: var(--space-4);
  padding-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-3xl);
  margin-bottom: var(--space-8);
  text-align: center;
}

/* Stats Overview */
.stats-overview {
  margin-bottom: var(--space-8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--space-4);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Sessions Section */
.sessions-section {
  margin-bottom: var(--space-8);
}

.section-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-4);
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.session-card {
  padding: var(--space-4);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.session-surah {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.surah-name {
  font-weight: 600;
  font-size: var(--text-lg);
}

.ayah-range {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.session-score {
  font-size: var(--text-2xl);
  font-weight: 700;
}

.session-stats {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.stat-mini {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.stat-mini--warning {
  color: var(--highlight-warning);
}

.stat-mini--error {
  color: var(--highlight-error);
}

.session-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-color);
}

.session-date {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.btn--sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-12);
  background-color: var(--bg-card);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--border-color);
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: var(--space-4);
}

.empty-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
}

.empty-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

/* Coming Soon */
.coming-soon {
  margin-top: var(--space-8);
}

.coming-soon-card {
  text-align: center;
  background: linear-gradient(
    135deg,
    var(--bg-secondary) 0%,
    var(--bg-card) 100%
  );
  padding: var(--space-8);
}

.coming-soon-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: var(--space-4);
}

.coming-soon-title {
  font-size: var(--text-xl);
  color: var(--color-primary);
  margin-bottom: var(--space-2);
}

.coming-soon-text {
  color: var(--text-secondary);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .session-stats {
    gap: var(--space-3);
  }
}
</style>

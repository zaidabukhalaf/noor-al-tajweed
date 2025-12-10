<script setup lang="ts">
/**
 * Progress Page (/progress/page.vue)
 *
 * Shows recitation history and practice statistics.
 * Uses localStorage-based session history for persistence.
 *
 * Note: Scores shown are from demo/mock analysis, not real tajweed evaluation.
 */

const { t, settings } = useAppSettings();
const sessionHistory = useSessionHistory();

// Format date
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
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

// Format time of day
function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString(
    settings.value.language === "ar" ? "ar" : "en",
    { hour: "2-digit", minute: "2-digit" }
  );
}

// Get stats
const stats = computed(() => sessionHistory.getTotalStats());
const streak = computed(() => sessionHistory.getPracticeStreak());
const sessions = computed(() => sessionHistory.getSessions());

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
        {{ t("سجل التدريب", "Practice History") }}
      </h1>
      <p class="page-subtitle">
        {{
          t(
            "تتبع جلسات التلاوة ومدة التدريب",
            "Track your recitation sessions and practice time"
          )
        }}
      </p>
    </header>

    <!-- Summary Stats -->
    <section class="stats-overview">
      <div class="stats-grid">
        <!-- Total Sessions -->
        <div class="stat-card">
          <div class="stat-icon">🎙️</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalSessions }}</span>
            <span class="stat-label">{{ t("جلسة", "Sessions") }}</span>
          </div>
        </div>

        <!-- Total Time -->
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalTimeFormatted }}</span>
            <span class="stat-label">{{
              t("وقت التدريب", "Practice Time")
            }}</span>
          </div>
        </div>

        <!-- Streak -->
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <span class="stat-value">{{ streak }}</span>
            <span class="stat-label">{{
              t("أيام متتالية", "Day Streak")
            }}</span>
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
        <span class="empty-icon">📖</span>
        <h3 class="empty-title">
          {{ t("لا توجد جلسات بعد", "No sessions yet") }}
        </h3>
        <p class="empty-text">
          {{
            t(
              "ابدأ تلاوتك الأولى لتظهر هنا",
              "Complete your first recitation to see it here"
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
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="session-header">
            <div class="session-info">
              <span class="session-date">
                {{ formatDate(session.timestamp) }} •
                {{ formatTime(session.timestamp) }}
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
          </div>

          <div class="session-meta">
            <span class="meta-item">
              ⏱️ {{ sessionHistory.formatDuration(session.durationMs) }}
            </span>
            <span
              v-if="session.mockScore !== undefined"
              class="meta-item demo-score"
            >
              📊 {{ session.mockScore }}%
              <span class="demo-label">{{ t("تجريبي", "Demo") }}</span>
            </span>
          </div>

          <div class="session-actions">
            <NuxtLink
              :to="`/recite?surah=${session.surahNumber}`"
              class="btn btn--ghost btn--sm"
            >
              {{ t("إعادة التلاوة", "Recite Again") }}
            </NuxtLink>
          </div>
        </article>
      </div>
    </section>

    <!-- Demo Notice -->
    <aside v-if="sessions.length > 0" class="demo-notice">
      <p>
        {{
          t(
            "ℹ️ النتائج المعروضة تجريبية. سيتم إضافة تقييم التجويد الحقيقي قريباً.",
            "ℹ️ Scores shown are demo values. Real tajweed evaluation coming soon."
          )
        }}
      </p>
    </aside>
  </div>
</template>

<style scoped>
.progress-page {
  padding-top: var(--space-8);
  padding-bottom: var(--space-12);
  max-width: 800px;
  margin: 0 auto;
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
  margin-bottom: var(--space-10);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.stat-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: var(--space-5);
  text-align: center;
  transition: transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: var(--space-2);
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
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: var(--space-1);
}

/* Sessions Section */
.sessions-section {
  margin-bottom: var(--space-8);
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
  animation: fadeInUp 0.4s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.session-header {
  margin-bottom: var(--space-3);
}

.session-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: block;
  margin-bottom: var(--space-1);
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

.session-meta {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.meta-item {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.demo-score {
  position: relative;
}

.demo-label {
  font-size: var(--text-xs);
  background: var(--bg-tertiary);
  color: var(--text-muted);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  margin-left: var(--space-1);
}

.session-actions {
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-color);
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
  opacity: 0.4;
}

.empty-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
}

.empty-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

/* Demo Notice */
.demo-notice {
  text-align: center;
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-lg);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Kids Mode */
.progress-page--kids {
  --color-primary: #8e44ad;
}

.progress-page--kids .page-title {
  color: #d35400;
  font-weight: 800;
}

.progress-page--kids .stat-card {
  border: 2px solid #f1c40f;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .stat-card {
    flex-direction: row;
    text-align: left;
    gap: var(--space-4);
  }

  .stat-icon {
    font-size: 1.5rem;
    margin-bottom: 0;
  }

  .stat-content {
    flex: 1;
  }

  .session-meta {
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>

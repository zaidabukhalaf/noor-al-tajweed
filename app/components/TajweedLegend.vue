<script setup lang="ts">
/**
 * TajweedLegend.vue
 *
 * Displays the color legend for tajwīd feedback.
 * Explains what each highlight color means.
 */

const { t } = useAppSettings();

interface LegendItem {
  status: string;
  colorVar: string;
  icon: string;
  label: string;
  description: string;
}

const legendItems = computed<LegendItem[]>(() => [
  {
    status: "current",
    colorVar: "var(--color-primary)",
    icon: "▶️",
    label: t("الكلمة الحالية", "Current Word"),
    description: t(
      "الكلمة التي تتلوها الآن",
      "The word you are currently reciting"
    ),
  },
  {
    status: "correct",
    colorVar: "var(--highlight-correct)",
    icon: "✅",
    label: t("تلاوة صحيحة", "Correct"),
    description: t("أحسنت! التجويد صحيح", "Well done! Tajwīd is correct"),
  },
  {
    status: "warning",
    colorVar: "var(--highlight-warning)",
    icon: "⚠️",
    label: t("يحتاج تحسين", "Needs Improvement"),
    description: t("ملاحظة بسيطة على التجويد", "Minor tajwīd suggestion"),
  },
  {
    status: "error",
    colorVar: "var(--highlight-error)",
    icon: "❌",
    label: t("خطأ في التجويد", "Tajwīd Error"),
    description: t("يرجى مراجعة هذه الكلمة", "Please review this word"),
  },
]);
</script>

<template>
  <div class="legend">
    <h3 class="legend-title">
      {{ t("دليل الألوان", "Color Legend") }}
    </h3>

    <ul class="legend-list">
      <li v-for="item in legendItems" :key="item.status" class="legend-item">
        <span class="legend-icon">{{ item.icon }}</span>
        <div class="legend-content">
          <span class="legend-label" :style="{ color: item.colorVar }">
            {{ item.label }}
          </span>
          <span class="legend-description">
            {{ item.description }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.legend {
  background-color: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--border-color);
}

.legend-title {
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--text-primary);
}

.legend-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.legend-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.legend-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.legend-label {
  font-weight: 600;
  font-size: var(--text-sm);
}

.legend-description {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Compact mode for sidebar */
.legend--compact .legend-description {
  display: none;
}

.legend--compact .legend-item {
  gap: var(--space-2);
}
</style>

<script setup lang="ts">
/**
 * MainLayout.vue
 *
 * Shared layout with header, footer, language toggle, and theme toggle.
 * Supports RTL Arabic layout.
 */

const { settings, toggleTheme, toggleLanguage, t, isRTL, isDarkMode } =
  useAppSettings();

// Navigation items
const navItems = computed(() => [
  {
    href: "/",
    label: t("الرئيسية", "Home"),
    icon: "🏠",
  },
  {
    href: "/recite",
    label: t("التلاوة", "Recite"),
    icon: "🎙️",
  },
  {
    href: "/progress",
    label: t("التقدم", "Progress"),
    icon: "📊",
  },
  {
    href: "/settings",
    label: t("الإعدادات", "Settings"),
    icon: "⚙️",
  },
]);
</script>

<template>
  <div class="layout">
    <!-- Skip Link for Accessibility -->
    <a href="#main-content" class="skip-link">
      {{ t("انتقل إلى المحتوى", "Skip to content") }}
    </a>

    <!-- Header -->
    <header class="header">
      <div class="container flex-between">
        <!-- Logo & App Name -->
        <NuxtLink to="/" class="header-brand">
          <span class="header-logo">🌙</span>
          <span class="header-title">{{
            t("نور التجويد", "Noor Tajweed")
          }}</span>
        </NuxtLink>

        <!-- Navigation -->
        <nav
          class="header-nav"
          :aria-label="t('التنقل الرئيسي', 'Main navigation')"
        >
          <NuxtLink
            v-for="item in navItems"
            :key="item.href"
            :to="item.href"
            class="nav-link"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <!-- Actions -->
        <div class="header-actions">
          <!-- Language Toggle -->
          <button
            class="btn btn--ghost btn--icon"
            :aria-label="t('تغيير اللغة', 'Change language')"
            @click="toggleLanguage"
          >
            <span>{{ settings.language === "ar" ? "EN" : "ع" }}</span>
          </button>

          <!-- Theme Toggle -->
          <button
            class="btn btn--ghost btn--icon"
            :aria-label="t('تغيير السمة', 'Toggle theme')"
            @click="toggleTheme"
          >
            <span>{{ isDarkMode ? "☀️" : "🌙" }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main id="main-content" class="main">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p class="footer-text">
          {{
            t(
              "نور التجويد - تعلم تجويد القرآن الكريم",
              "Noor Tajweed - Learn Qur'an recitation with tajwīd"
            )
          }}
        </p>
        <p class="footer-copyright">
          © {{ new Date().getFullYear() }} -
          {{ t("جميع الحقوق محفوظة", "All rights reserved") }}
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-3) 0;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--text-primary);
}

.header-logo {
  font-size: 1.75rem;
}

.header-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

/* Navigation */
.header-nav {
  display: flex;
  gap: var(--space-2);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-link.router-link-active {
  background-color: var(--color-primary);
  color: var(--text-inverse);
}

.nav-icon {
  font-size: 1.125rem;
}

.nav-label {
  font-size: var(--text-sm);
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: var(--space-2);
}

/* Main Content */
.main {
  flex: 1;
  padding: var(--space-8) 0;
}

/* Footer */
.footer {
  padding: var(--space-6) 0;
  text-align: center;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.footer-text {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--space-2);
}

.footer-copyright {
  color: var(--text-muted);
  font-size: var(--text-xs);
  margin-bottom: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--bg-card);
    border-top: 1px solid var(--border-color);
    padding: var(--space-2) var(--space-4);
    justify-content: space-around;
    z-index: var(--z-sticky);
  }

  .nav-label {
    display: none;
  }

  .nav-link {
    padding: var(--space-3);
  }

  .nav-icon {
    font-size: 1.5rem;
  }

  .main {
    padding-bottom: calc(var(--space-16) + var(--space-8));
  }

  .header-title {
    font-size: var(--text-lg);
  }
}
</style>

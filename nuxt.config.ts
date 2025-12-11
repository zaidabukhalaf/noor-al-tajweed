// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // App configuration
  app: {
    head: {
      htmlAttrs: {
        lang: "ar",
        dir: "rtl",
      },
      title: "نور التجويد | Noor Tajweed",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "تطبيق تفاعلي لتعلم تجويد القرآن الكريم - Interactive Qur'an recitation training with real-time tajwīd feedback",
        },
        { name: "theme-color", content: "#1e3a5f" },
      ],
      link: [
        // Google Fonts for UI (Arabic + English)
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap",
        },
      ],
    },
  },

  // CSS
  css: ["~/styles/main.css"],

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false, // Disabled for dev, can be enabled with vue-tsc installed
  },

  // SSR configuration (SPA-friendly but SSR capable)
  ssr: true,

  // Modules
  modules: [],

  // Runtime config
  runtimeConfig: {
    public: {
      appName: "نور التجويد",
      appNameEn: "Noor Tajweed",
    },
  },

  // Cloudflare Pages deployment
  nitro: {
    preset: "cloudflare-pages",
  },
});

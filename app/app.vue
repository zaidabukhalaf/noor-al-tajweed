<script setup lang="ts">
/**
 * app.vue
 *
 * Root application component.
 * Sets up the main layout wrapper.
 */

// Initialize app settings on mount
const { settings } = useAppSettings();
</script>

<template>
  <NuxtLayout name="main-layout">
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Import global styles */
</style>

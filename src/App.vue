<script setup lang="ts">
import { onMounted } from "vue";
import { useTheme } from "@/composables/useTheme";

// Инициализируем тему при загрузке приложения
const { initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<template>
  <RouterView />
</template>

<style>
/* Глобальные стили в main.css */
</style>

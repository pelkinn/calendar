<script setup lang="ts">
import { onMounted } from "vue";
import { useTheme } from "@/composables/useTheme";
import { useReveal } from "@/composables/useReveal";

// Инициализируем тему при загрузке приложения
const { initTheme } = useTheme();

// Появление блоков при скролле
useReveal();

onMounted(() => {
  initTheme();
});
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <!--
      mode="out-in": страницы не накладываются друг на друга, иначе при разной
      высоте контента вьюпорт дёргается в момент пересечения.
    -->
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style>
/* Глобальные стили в main.css */
</style>

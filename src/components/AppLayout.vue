<script setup lang="ts">
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";

withDefaults(
  defineProps<{
    /**
     * text — статьи в узкой колонке 720px,
     * narrow — контент и таблицы в колонке 860px,
     * wide — календарь во всю ширину.
     */
    width?: "text" | "narrow" | "wide";
  }>(),
  { width: "narrow" },
);
</script>

<template>
  <div class="app-shell">
    <AppHeader>
      <template #actions>
        <slot name="header-actions" />
      </template>
    </AppHeader>

    <!-- Заголовок страницы: хлебные крошки, H1, сводка -->
    <slot name="page-header" />

    <main class="app-main" :class="`app-main--${width}`">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}

.app-main {
  flex: 1;
}

.app-main--narrow,
.app-main--text {
  width: 100%;
  margin: 0 auto;
  padding: 40px 32px 8px;
  box-sizing: border-box;
}

.app-main--narrow {
  max-width: 860px;
}

.app-main--text {
  max-width: 720px;
}

@media (max-width: 768px) {
  .app-main--narrow,
  .app-main--text {
    padding: 24px 16px 4px;
  }
}
</style>

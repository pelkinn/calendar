<script setup lang="ts">
import { RouterLink } from "vue-router";

export interface Crumb {
  label: string;
  /** Последний элемент цепочки без ссылки */
  to?: string;
}

defineProps<{ items: Crumb[] }>();
</script>

<template>
  <div class="breadcrumbs-bar">
    <nav class="breadcrumbs" aria-label="Хлебные крошки">
      <template v-for="(item, i) in items" :key="i">
        <span v-if="i > 0" class="breadcrumbs__sep">/</span>
        <RouterLink v-if="item.to" :to="item.to">{{ item.label }}</RouterLink>
        <span v-else class="breadcrumbs__current">{{ item.label }}</span>
      </template>
    </nav>
  </div>
</template>

<style scoped>
.breadcrumbs-bar {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 860px;
  margin: 0 auto;
  padding: 10px 32px;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.breadcrumbs a {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.16s var(--ease);
}

.breadcrumbs a:hover {
  color: var(--color-text);
}

.breadcrumbs__sep {
  opacity: 0.5;
}

.breadcrumbs__current {
  color: var(--color-text);
}

@media (max-width: 768px) {
  .breadcrumbs {
    padding: 10px 16px;
  }
}

@media print {
  .breadcrumbs-bar {
    display: none;
  }
}
</style>

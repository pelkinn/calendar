<script setup lang="ts">
import type { MonthData } from "@/types/calendar";
import MonthCard from "./MonthCard.vue";

defineProps<{
  months: MonthData[];
}>();
</script>

<template>
  <div class="months-grid">
    <MonthCard v-for="month in months" :key="month.monthIndex" :month="month" />
  </div>
</template>

<style scoped>
.months-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 28px 32px;
}

/* Адаптив: планшет — 3 колонки */
@media (max-width: 1024px) {
  .months-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 24px;
  }
}

/* Адаптив: узкий планшет — 2 колонки */
@media (max-width: 768px) {
  .months-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 16px;
  }
}

/* Адаптив: мобильные — 1 колонка */
@media (max-width: 480px) {
  .months-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}
</style>

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
/* Широкий экран: без боковой колонки помещается полгода в ряд,
   поэтому весь год читается двумя строками */
.months-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--month-gap);
  padding: 0 32px;
}

@media (max-width: 1400px) {
  .months-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .months-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .months-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 0 16px;
  }
}

@media (max-width: 520px) {
  .months-grid {
    grid-template-columns: 1fr;
  }
}
</style>

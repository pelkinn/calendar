<script setup lang="ts">
import type { MonthData, MonthCell } from "@/types/calendar";
import { useSelectedDate } from "@/composables/useSelectedDate";

defineProps<{
  month: MonthData;
}>();

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const { isSelected, toggleDate } = useSelectedDate();

const handleDayClick = (cell: MonthCell) => {
  if (cell.day !== null && cell.date) {
    toggleDate(cell.date);
  }
};
</script>

<template>
  <article class="month-card">
    <h3 class="month-title">{{ month.name }}</h3>

    <table class="month-table">
      <thead>
        <tr class="weekdays-row">
          <th
            v-for="(day, index) in weekdays"
            :key="day"
            class="weekday-header"
            :class="{ weekend: index >= 5 }"
          >
            {{ day }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(week, weekIndex) in month.matrix"
          :key="weekIndex"
          class="week-row"
        >
          <td
            v-for="(cell, cellIndex) in week"
            :key="cellIndex"
            class="day-cell"
            :class="{
              empty: cell.day === null,
              weekend: cell.isWeekend,
              weekday: !cell.isWeekend && cell.day !== null,
              today: cell.isToday,
              selected: isSelected(cell.date),
              clickable: cell.day !== null,
            }"
            @click="handleDayClick(cell)"
          >
            <span v-if="cell.day !== null" class="day-number">
              {{ cell.day }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </article>
</template>

<style scoped>
.month-card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: 0 1px 2px var(--color-shadow);
  transition: box-shadow 0.2s ease;
}

.month-card:hover {
  box-shadow: 0 2px 8px var(--color-shadow-lg);
}

.month-title {
  font-size: 0.9375rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.month-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.weekdays-row {
  border-bottom: 1px solid var(--color-border);
}

.weekday-header {
  font-size: 0.6875rem;
  font-weight: 500;
  text-align: center;
  padding: 6px 2px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.weekday-header.weekend {
  color: var(--color-weekend);
  opacity: 0.85;
}

.week-row {
  height: 28px;
}

.day-cell {
  text-align: center;
  vertical-align: middle;
  padding: 2px;
  font-size: 0.8125rem;
}

.day-cell.empty {
  background: transparent;
}

.day-cell.weekday {
  color: var(--color-weekday);
}

.day-cell.weekend {
  color: var(--color-weekend);
}

.day-cell.today .day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--color-today-bg);
  border: 2px solid var(--color-today-border);
  border-radius: 50%;
  font-weight: 600;
}

.day-number {
  display: inline-block;
  min-width: 18px;
}

.day-cell.clickable {
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
}

.day-cell.clickable:hover {
  background-color: var(--color-hover);
}

.day-cell.selected .day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--color-selected-bg);
  color: var(--color-selected-text);
  border-radius: 50%;
  font-weight: 600;
}

/* Если выбран сегодняшний день — комбинируем стили */
.day-cell.today.selected .day-number {
  background-color: var(--color-today-bg);
  border: 2px solid var(--color-today-border);
  color: var(--color-text);
}
</style>

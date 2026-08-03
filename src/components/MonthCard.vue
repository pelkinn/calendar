<script setup lang="ts">
import { computed } from "vue";
import type { MonthData, MonthCell } from "@/types/calendar";
import { useSelectedDate } from "@/composables/useSelectedDate";
import { useHolidays } from "@/composables/useHolidays";
import { useProductionCalendar } from "@/composables/useProductionCalendar";
import { getMonthHolidays, type Holiday } from "@/data/holidays";

const props = defineProps<{
  month: MonthData;
}>();

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const { isSelected, toggleDate } = useSelectedDate();
const { showHolidays } = useHolidays();
const {
  hasDataForYear,
  isNonWorkingDay,
  isTransferredHoliday,
  isShortenedDay,
} = useProductionCalendar();

// Кэшируем праздники для текущего месяца (названия)
const monthHolidays = computed(() => getMonthHolidays(props.month.monthIndex));

const getHolidayForCell = (cell: MonthCell): Holiday | null => {
  if (!cell.day) return null;
  return monthHolidays.value.get(cell.day) ?? null;
};

/** Данные производственного календаря доступны для этого года */
const hasProductionData = computed(() => hasDataForYear(props.month.year));

/**
 * Эффективный нерабочий день:
 * — если производственный календарь включён и есть данные, используем их
 * — иначе стандартная логика Сб/Вс
 */
const isEffectivelyNonWorking = (cell: MonthCell): boolean => {
  if (!cell.day) return false;
  if (showHolidays.value && hasProductionData.value) {
    return isNonWorkingDay(props.month.year, props.month.monthIndex, cell.day);
  }
  return cell.isWeekend;
};

/**
 * Эффективный рабочий день
 */
const isEffectivelyWorking = (cell: MonthCell): boolean => {
  if (!cell.day) return false;
  return !isEffectivelyNonWorking(cell);
};

/**
 * Праздничный день (официальный праздник или перенесённый выходной).
 * Выделяется независимо от того, выпал на будний или выходной день.
 *
 * Не включает обычные Сб/Вс без праздника.
 */
const isHolidayCell = (cell: MonthCell): boolean => {
  if (!cell.day || !showHolidays.value || !hasProductionData.value) {
    return false;
  }
  const { year, monthIndex } = props.month;
  // Фиксированный праздник (День Победы, 8 Марта и т.д.)
  if (getHolidayForCell(cell)) return true;
  // Перенесённый выходной (будний день стал нерабочим)
  if (isTransferredHoliday(year, monthIndex, cell.day)) return true;
  // Нерабочий будний день, не попавший в FIXED_HOLIDAYS
  if (!cell.isWeekend && isNonWorkingDay(year, monthIndex, cell.day)) {
    return true;
  }
  return false;
};

/**
 * Сокращённый рабочий день (предпраздничный)
 */
const isShortenedCell = (cell: MonthCell): boolean => {
  if (!cell.day || !showHolidays.value || !hasProductionData.value) {
    return false;
  }
  return isShortenedDay(props.month.year, props.month.monthIndex, cell.day);
};

/**
 * Тултип для дня
 */
const getTooltip = (cell: MonthCell): string | undefined => {
  if (!cell.day || !showHolidays.value) return undefined;

  const fixedHoliday = getHolidayForCell(cell);
  const { year, monthIndex } = props.month;

  if (hasProductionData.value) {
    // Фиксированный праздник (показываем название и на выходных, и на буднях)
    if (fixedHoliday?.name) return fixedHoliday.name;
    // Перенесённый выходной
    if (isTransferredHoliday(year, monthIndex, cell.day)) {
      return "Выходной день (перенос)";
    }
    // Нерабочий будний день без названия
    if (!cell.isWeekend && isNonWorkingDay(year, monthIndex, cell.day)) {
      return "Выходной день";
    }
    // Сокращённый рабочий день
    if (isShortenedDay(year, monthIndex, cell.day)) {
      return "Сокращённый день";
    }
  }

  // Фолбэк: фиксированные праздники
  return fixedHoliday?.name;
};

/**
 * Сколько в месяце рабочих дней — по тем же правилам, что раскрашены ячейки,
 * поэтому цифра всегда сходится с тем, что человек видит в сетке.
 */
const workDaysCount = computed(() => {
  let count = 0;
  for (const week of props.month.matrix) {
    for (const cell of week) {
      if (cell.day !== null && isEffectivelyWorking(cell)) count++;
    }
  }
  return count;
});

const handleDayClick = (cell: MonthCell) => {
  if (cell.day !== null && cell.date) {
    toggleDate(cell.date);
  }
};
</script>

<template>
  <article class="month-card">
    <div class="month-head">
      <h3 class="month-title">{{ month.name }}</h3>
      <span class="month-count">{{ workDaysCount }} раб.</span>
    </div>

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
              weekend: isEffectivelyNonWorking(cell),
              weekday: isEffectivelyWorking(cell),
              today: cell.isToday,
              selected: isSelected(cell.date),
              clickable: cell.day !== null,
              'production-holiday': isHolidayCell(cell),
              'shortened-day': isShortenedCell(cell),
            }"
            :data-tooltip="getTooltip(cell)"
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
  padding: 16px 15px 13px;
  transition:
    border-color 0.2s var(--ease),
    transform 0.2s var(--ease),
    box-shadow 0.2s var(--ease);
}

.month-card:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.month-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.month-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.015em;
}

.month-count {
  font-size: 0.71875rem;
  color: var(--color-text-faint);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.month-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 1px;
  table-layout: fixed;
  font-variant-numeric: tabular-nums;
}

.weekday-header {
  font-size: 0.625rem;
  font-weight: 600;
  text-align: center;
  padding: 0 0 5px;
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.weekday-header.weekend {
  color: var(--color-weekend);
  opacity: 0.72;
}

.day-cell {
  position: relative;
  text-align: center;
  vertical-align: middle;
  padding: 0;
  font-size: 0.78125rem;
}

.day-cell.empty {
  background: transparent;
}

/* Номер — сам по себе интерактивная площадка, поэтому масштабируется он,
   а не ячейка таблицы: иначе прыгает вся строка */
.day-number {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  width: 100%;
  /* Иначе на широкой карточке ячейки растягиваются и числа теряют строй */
  max-width: 34px;
  margin: 0 auto;
  border-radius: var(--radius-sm);
  color: var(--color-weekday);
  transition:
    background-color 0.13s var(--ease),
    color 0.13s var(--ease),
    transform 0.13s var(--ease);
}

.day-cell.clickable {
  cursor: pointer;
}

.day-cell.clickable:hover .day-number {
  background-color: var(--color-bg-secondary);
  transform: scale(1.12);
}

[data-theme="dark"] .day-cell.clickable:hover .day-number {
  background-color: var(--color-border);
}

.day-cell.weekend .day-number {
  color: var(--color-weekend);
  font-weight: 500;
}

/* Сегодня — единственная сплошная заливка акцентом на странице */
.day-cell.today .day-number {
  background-color: var(--color-today-bg);
  color: var(--color-today-text);
  font-weight: 600;
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.day-cell.today.clickable:hover .day-number {
  background-color: var(--color-today-bg);
  color: var(--color-today-text);
}

.day-cell.selected .day-number {
  background-color: var(--color-selected-bg);
  color: var(--color-selected-text);
  font-weight: 600;
}

.day-cell.selected.clickable:hover .day-number {
  background-color: var(--color-selected-bg);
}

/* Выбранное «сегодня» остаётся сегодня — акцентная заливка сильнее */
.day-cell.today.selected .day-number {
  background-color: var(--color-today-bg);
  color: var(--color-today-text);
}

/* === Производственный календарь ===
   Точки под числом в сетке 26px не читались, поэтому состояние несёт
   заливка ячейки: праздники и сокращённые дни видно с одного взгляда. */

.day-cell.production-holiday .day-number {
  background-color: var(--color-holiday-active-bg);
  color: var(--color-holiday-official);
  font-weight: 600;
}

.day-cell.production-holiday.clickable:hover .day-number {
  background-color: var(--color-holiday-active-bg);
  filter: brightness(0.96);
}

[data-theme="dark"] .day-cell.production-holiday.clickable:hover .day-number {
  filter: brightness(1.35);
}

/* Сокращённый день: заливка плюс черта снизу — чтобы состояние читалось
   не только цветом */
.day-cell.shortened-day .day-number {
  background-color: var(--color-shortened-bg);
  color: var(--color-holiday);
  font-weight: 600;
  box-shadow: inset 0 -2px 0 var(--color-holiday);
}

.day-cell.shortened-day.clickable:hover .day-number {
  background-color: var(--color-shortened-bg);
}

/* Сегодня перекрывает всё: это единственная сплошная заливка */
.day-cell.today .day-number,
.day-cell.today.production-holiday .day-number,
.day-cell.today.shortened-day .day-number {
  background-color: var(--color-today-bg);
  color: var(--color-today-text);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

/* Тултип при наведении */
.day-cell[data-tooltip] {
  cursor: help;
}

.day-cell[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 9px;
  background-color: var(--color-tooltip-bg);
  color: var(--color-tooltip-text);
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  z-index: 100;
  pointer-events: none;
}

.day-cell[data-tooltip]:hover::before {
  content: "";
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--color-tooltip-bg);
  z-index: 100;
  pointer-events: none;
}
</style>

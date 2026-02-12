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
            <span v-if="isHolidayCell(cell)" class="holiday-dot"></span>
            <span v-if="isShortenedCell(cell)" class="shortened-dot"></span>
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

/* === Производственный календарь === */

/* Праздничный нерабочий день на будний (не выходной) */
.day-cell.production-holiday {
  position: relative;
}

.day-cell.production-holiday .day-number {
  color: var(--color-holiday-official);
  font-weight: 700;
}

/* Точка-индикатор под праздничным днём */
.holiday-dot {
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-holiday-official);
}

/* Сокращённый рабочий день (предпраздничный) */
.day-cell.shortened-day {
  position: relative;
}

.shortened-dot {
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 2px;
  border-radius: 1px;
  background-color: var(--color-holiday);
}

/* Тултип при наведении */
.day-cell[data-tooltip] {
  cursor: help;
}

.day-cell[data-tooltip]:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background-color: var(--color-tooltip-bg);
  color: var(--color-tooltip-text);
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  border-radius: var(--radius-sm);
  box-shadow: 0 2px 8px var(--color-shadow-lg);
  z-index: 100;
  pointer-events: none;
}

.day-cell[data-tooltip]:hover::before {
  content: "";
  position: absolute;
  bottom: calc(100% + 0px);
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--color-tooltip-bg);
  z-index: 100;
  pointer-events: none;
}
</style>

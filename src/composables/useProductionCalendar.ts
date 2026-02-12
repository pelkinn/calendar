import { computed } from "vue";
import calendarJson from "@/data/production-calendar.json";

/**
 * Данные производственного календаря для одного месяца
 */
interface MonthCalendarData {
  /** Нерабочие дни (праздники + выходные + перенесённые выходные) */
  nonWorkingDays: Set<number>;
  /** Перенесённые выходные (подмножество nonWorkingDays, для тултипов) */
  transferredHolidays: Set<number>;
  /** Сокращённые рабочие дни (предпраздничные) */
  shortenedDays: Set<number>;
}

interface ProductionCalendarYear {
  months: Map<number, MonthCalendarData>;
}

/**
 * Парсит строку дней из xmlcalendar.ru
 *
 * Все дни в списке `days` — нерабочие (или сокращённые рабочие).
 *
 * Формат:
 *   "1,2,3,4,5,6,7,8,9+,10,11,30*"
 *   - без суффикса: нерабочий день (праздник или обычный выходной)
 *   - суффикс "+": нерабочий день, перенесённый с праздника на выходной
 *   - суффикс "*": сокращённый рабочий день (предпраздничный)
 */
function parseDays(daysStr: string): MonthCalendarData {
  const nonWorkingDays = new Set<number>();
  const transferredHolidays = new Set<number>();
  const shortenedDays = new Set<number>();

  if (!daysStr) {
    return { nonWorkingDays, transferredHolidays, shortenedDays };
  }

  for (const part of daysStr.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.endsWith("+")) {
      // Перенесённый выходной — нерабочий день
      const day = parseInt(trimmed.slice(0, -1), 10);
      if (!isNaN(day)) {
        nonWorkingDays.add(day);
        transferredHolidays.add(day);
      }
    } else if (trimmed.endsWith("*")) {
      // Сокращённый рабочий день (всё ещё рабочий)
      const day = parseInt(trimmed.slice(0, -1), 10);
      if (!isNaN(day)) shortenedDays.add(day);
    } else {
      // Обычный нерабочий день
      const day = parseInt(trimmed, 10);
      if (!isNaN(day)) nonWorkingDays.add(day);
    }
  }

  return { nonWorkingDays, transferredHolidays, shortenedDays };
}

// === Кеш распарсенных данных ===
const parsedCache = new Map<number, ProductionCalendarYear>();

/**
 * Получить распарсенные данные для года (с кешированием)
 */
function getYearData(year: number): ProductionCalendarYear | null {
  if (parsedCache.has(year)) {
    return parsedCache.get(year)!;
  }

  const raw = (
    calendarJson as Record<
      string,
      { months: { month: number; days: string }[] }
    >
  )[String(year)];
  if (!raw) return null;

  const months = new Map<number, MonthCalendarData>();
  for (const entry of raw.months) {
    months.set(entry.month - 1, parseDays(entry.days)); // 1-based → 0-based
  }

  const result: ProductionCalendarYear = { months };
  parsedCache.set(year, result);
  return result;
}

/**
 * Composable для работы с производственным календарём
 *
 * Данные загружаются при билде из xmlcalendar.ru
 * и вшиты в бандл как статический JSON.
 */
export function useProductionCalendar() {
  /**
   * Проверяет, есть ли данные для указанного года
   */
  const hasDataForYear = (year: number): boolean => {
    return String(year) in (calendarJson as Record<string, unknown>);
  };

  /**
   * Список доступных годов
   */
  const availableYears = computed(() =>
    Object.keys(calendarJson as Record<string, unknown>)
      .map(Number)
      .sort((a, b) => a - b),
  );

  /**
   * День является нерабочим по производственному календарю
   * (праздник, выходной или перенесённый выходной)
   */
  const isNonWorkingDay = (
    year: number,
    monthIndex: number,
    day: number,
  ): boolean => {
    const data = getYearData(year);
    if (!data) return false;
    const monthData = data.months.get(monthIndex);
    if (!monthData) return false;
    return monthData.nonWorkingDays.has(day);
  };

  /**
   * День является перенесённым выходным
   * (праздник выпал на выходной → перенесён на будний)
   */
  const isTransferredHoliday = (
    year: number,
    monthIndex: number,
    day: number,
  ): boolean => {
    const data = getYearData(year);
    if (!data) return false;
    const monthData = data.months.get(monthIndex);
    if (!monthData) return false;
    return monthData.transferredHolidays.has(day);
  };

  /**
   * День является сокращённым рабочим (предпраздничный)
   */
  const isShortenedDay = (
    year: number,
    monthIndex: number,
    day: number,
  ): boolean => {
    const data = getYearData(year);
    if (!data) return false;
    const monthData = data.months.get(monthIndex);
    if (!monthData) return false;
    return monthData.shortenedDays.has(day);
  };

  return {
    availableYears,
    hasDataForYear,
    isNonWorkingDay,
    isTransferredHoliday,
    isShortenedDay,
  };
}

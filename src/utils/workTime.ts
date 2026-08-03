import { daysInMonth } from "@/utils/date";
import { getMonthCalendarData } from "@/composables/useProductionCalendar";

/**
 * Продолжительность рабочей недели в часах.
 * 40 — общая норма, 36 — сокращённая (вредные условия, педагоги, инвалиды
 * I и II групп), 24 — для работников 15–16 лет.
 */
export const WEEK_HOURS = [40, 36, 24] as const;
export type WeekHours = (typeof WEEK_HOURS)[number];

/** Норма рабочего времени за период */
export interface WorkTimeStats {
  /** Календарные дни */
  calendarDays: number;
  /** Рабочие дни */
  workDays: number;
  /** Выходные и нерабочие праздничные дни */
  restDays: number;
  /** Сокращённые на 1 час предпраздничные дни */
  shortenedDays: number;
  /** Норма часов при 40 / 36 / 24-часовой неделе */
  hours: Record<WeekHours, number>;
}

/** Статистика месяца с его порядковым номером */
export interface MonthWorkTime extends WorkTimeStats {
  monthIndex: number;
}

/**
 * Норма часов по методике Минтруда: продолжительность рабочей недели
 * делится на 5 (дней) и умножается на число рабочих дней, из результата
 * вычитается по часу за каждый предпраздничный день.
 */
function calcHours(
  workDays: number,
  shortenedDays: number,
  weekHours: WeekHours,
): number {
  const raw = (weekHours / 5) * workDays - shortenedDays;
  // 36 и 24 часа дают дробную норму (7,2 и 4,8 ч в день) — округляем до 0,1
  return Math.round(raw * 10) / 10;
}

function buildStats(
  calendarDays: number,
  restDays: number,
  shortenedDays: number,
): WorkTimeStats {
  const workDays = calendarDays - restDays;
  return {
    calendarDays,
    workDays,
    restDays,
    shortenedDays,
    hours: {
      40: calcHours(workDays, shortenedDays, 40),
      36: calcHours(workDays, shortenedDays, 36),
      24: calcHours(workDays, shortenedDays, 24),
    },
  };
}

/**
 * Норма рабочего времени за месяц.
 * @param monthIndex - месяц (0-11)
 * @returns null, если производственного календаря на год нет
 */
export function getMonthWorkTime(
  year: number,
  monthIndex: number,
): MonthWorkTime | null {
  const data = getMonthCalendarData(year, monthIndex);
  if (!data) return null;

  const stats = buildStats(
    daysInMonth(year, monthIndex),
    data.nonWorkingDays.size,
    data.shortenedDays.size,
  );
  return { monthIndex, ...stats };
}

/**
 * Нормы по всем месяцам года. Пустой массив, если данных нет.
 */
export function getYearMonths(year: number): MonthWorkTime[] {
  const months: MonthWorkTime[] = [];
  for (let i = 0; i < 12; i++) {
    const month = getMonthWorkTime(year, i);
    if (!month) return [];
    months.push(month);
  }
  return months;
}

/**
 * Суммирует нормы за произвольный набор месяцев
 */
export function sumWorkTime(months: MonthWorkTime[]): WorkTimeStats {
  return buildStats(
    months.reduce((acc, m) => acc + m.calendarDays, 0),
    months.reduce((acc, m) => acc + m.restDays, 0),
    months.reduce((acc, m) => acc + m.shortenedDays, 0),
  );
}

/** Норма за квартал (1-4) */
export function getQuarterWorkTime(
  months: MonthWorkTime[],
  quarter: number,
): WorkTimeStats | null {
  const slice = months.slice((quarter - 1) * 3, quarter * 3);
  return slice.length === 3 ? sumWorkTime(slice) : null;
}

/** Норма за полугодие (1-2) */
export function getHalfYearWorkTime(
  months: MonthWorkTime[],
  half: number,
): WorkTimeStats | null {
  const slice = months.slice((half - 1) * 6, half * 6);
  return slice.length === 6 ? sumWorkTime(slice) : null;
}

/** Форматирует часы: 1972 → "1972", 1774.8 → "1774,8" */
export function formatHours(hours: number): string {
  return String(Math.round(hours * 10) / 10).replace(".", ",");
}

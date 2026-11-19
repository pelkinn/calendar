import { getMonthCalendarData } from "@/composables/useProductionCalendar";

const MS_PER_DAY = 86_400_000;

/** Календарных дней между датами (без учёта времени) */
function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * Рабочий ли день по производственному календарю.
 * Если календаря на этот год нет — считаем по субботам и воскресеньям.
 */
function isWorkingDay(date: Date): boolean {
  const data = getMonthCalendarData(date.getFullYear(), date.getMonth());
  if (data) return !data.nonWorkingDays.has(date.getDate());

  const weekday = date.getDay();
  return weekday !== 0 && weekday !== 6;
}

/** Прибавляет календарные дни (отрицательное значение — вычитает) */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Непрерывный период отдыха */
export interface RestPeriod {
  from: Date;
  to: Date;
  days: number;
}

/**
 * Находит непрерывный блок нерабочих дней, в который попадает дата.
 * Нужен, чтобы показать, сколько дней подряд отдыхают вокруг праздника.
 * @returns null, если день рабочий
 */
export function getRestPeriod(date: Date): RestPeriod | null {
  if (isWorkingDay(date)) return null;

  const from = new Date(date);
  while (!isWorkingDay(addDays(from, -1))) {
    from.setDate(from.getDate() - 1);
  }

  const to = new Date(date);
  while (!isWorkingDay(addDays(to, 1))) {
    to.setDate(to.getDate() + 1);
  }

  return { from, to, days: daysBetween(from, to) + 1 };
}

/**
 * Склонение по числу: plural(5, ["день", "дня", "дней"]) → "дней"
 */
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

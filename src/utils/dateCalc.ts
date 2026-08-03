import { getMonthCalendarData } from "@/composables/useProductionCalendar";

const MS_PER_DAY = 86_400_000;

/** Парсит "YYYY-MM-DD" в Date (локальная полночь). null — если строка невалидна */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  // Отсекаем «31 февраля» и подобное — Date молча переносит на следующий месяц
  return date.getMonth() === Number(m) - 1 && date.getDate() === Number(d)
    ? date
    : null;
}

/** Date → "YYYY-MM-DD" */
export function toISODate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Дата прописью: "12 марта 2026 г., четверг" */
export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(date);
}

/** Календарных дней между датами (без учёта времени) */
export function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * Рабочий ли день по производственному календарю.
 * Если календаря на этот год нет — считаем по субботам и воскресеньям.
 */
export function isWorkingDay(date: Date): boolean {
  const data = getMonthCalendarData(date.getFullYear(), date.getMonth());
  if (data) return !data.nonWorkingDays.has(date.getDate());

  const weekday = date.getDay();
  return weekday !== 0 && weekday !== 6;
}

/** Сокращённый предпраздничный день (рабочий, но на час короче) */
export function isShortenedDay(date: Date): boolean {
  const data = getMonthCalendarData(date.getFullYear(), date.getMonth());
  return data?.shortenedDays.has(date.getDate()) ?? false;
}

/** Есть ли производственный календарь на весь период (иначе расчёт приблизительный) */
export function hasCalendarFor(from: Date, to: Date): boolean {
  for (let y = from.getFullYear(); y <= to.getFullYear(); y++) {
    if (!getMonthCalendarData(y, 0)) return false;
  }
  return true;
}

export interface PeriodStats {
  /** Календарные дни между датами */
  totalDays: number;
  /** Рабочие дни */
  workDays: number;
  /** Выходные и праздничные */
  restDays: number;
  /** Сокращённые на час предпраздничные дни (подмножество рабочих) */
  shortenedDays: number;
  /** Норма часов при 40-часовой неделе */
  workHours: number;
  /** Календарь известен на весь период */
  exact: boolean;
}

/**
 * Разбор периода [from; to] включительно.
 * @param includeEnd - включать ли последний день в подсчёт
 */
export function analyzePeriod(
  from: Date,
  to: Date,
  includeEnd = true,
): PeriodStats {
  const start = from <= to ? from : to;
  const end = from <= to ? to : from;

  let workDays = 0;
  let restDays = 0;
  let shortenedDays = 0;

  const cursor = new Date(start);
  const last = new Date(end);
  if (!includeEnd) last.setDate(last.getDate() - 1);

  while (cursor <= last) {
    if (isWorkingDay(cursor)) {
      workDays++;
      if (isShortenedDay(cursor)) shortenedDays++;
    } else {
      restDays++;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    totalDays: Math.abs(daysBetween(from, to)),
    workDays,
    restDays,
    shortenedDays,
    // Предпраздничный день короче на час (ст. 95 ТК РФ)
    workHours: workDays * 8 - shortenedDays,
    exact: hasCalendarFor(start, end),
  };
}

/** Прибавляет календарные дни (отрицательное значение — вычитает) */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Прибавляет рабочие дни: считаются только рабочие по производственному
 * календарю, выходные и праздники пропускаются.
 */
export function addWorkDays(date: Date, days: number): Date {
  const result = new Date(date);
  const step = days >= 0 ? 1 : -1;
  let left = Math.abs(days);

  while (left > 0) {
    result.setDate(result.getDate() + step);
    if (isWorkingDay(result)) left--;
  }

  return result;
}

/** Возраст в полных годах, месяцах и днях */
export interface AgeParts {
  years: number;
  months: number;
  days: number;
}

export function getAge(birth: Date, at: Date): AgeParts {
  let years = at.getFullYear() - birth.getFullYear();
  let months = at.getMonth() - birth.getMonth();
  let days = at.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    // Дни добираем из предыдущего месяца относительно расчётной даты
    const prevMonth = new Date(at.getFullYear(), at.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/** Номер недели по ISO 8601 (неделя с понедельника, первая — с 4 января) */
export function getISOWeek(date: Date): number {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  // Четверг текущей недели определяет её год и номер
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);

  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const firstDayNumber = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNumber + 3);

  return (
    1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY))
  );
}

/** Год, к которому неделя относится по ISO (может отличаться от года даты) */
export function getISOWeekYear(date: Date): number {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  return target.getUTCFullYear();
}

/** Порядковый номер дня в году */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return daysBetween(start, date) + 1;
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

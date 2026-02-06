/**
 * Ячейка календаря для одного дня
 */
export interface MonthCell {
  /** Число месяца (null для пустых ячеек) */
  day: number | null;
  /** Выходной день (Сб/Вс) */
  isWeekend: boolean;
  /** Сегодняшний день */
  isToday: boolean;
  /** Дата в формате ISO (YYYY-MM-DD) для дней, null для пустых */
  date: string | null;
}

/**
 * Матрица месяца — массив недель, каждая неделя — массив ячеек
 */
export type MonthMatrix = MonthCell[][];

/**
 * Информация о месяце
 */
export interface MonthData {
  /** Индекс месяца (0-11) */
  monthIndex: number;
  /** Название месяца на русском */
  name: string;
  /** Год */
  year: number;
  /** Матрица дней */
  matrix: MonthMatrix;
}

/**
 * Константы для валидации года
 */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;

/**
 * Диапазон годов для бокового меню
 */
export const SIDEBAR_YEAR_START = 1950;
export const SIDEBAR_YEAR_END = 2050;

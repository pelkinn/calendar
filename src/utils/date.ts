import type { MonthCell, MonthMatrix, MonthData } from "@/types/calendar";

/**
 * Проверяет, является ли год високосным
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Возвращает количество дней в месяце
 * @param year - год
 * @param month - месяц (0-11)
 */
export function daysInMonth(year: number, month: number): number {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 1 && isLeapYear(year)) {
    return 29;
  }
  return daysPerMonth[month];
}

/**
 * Возвращает индекс дня недели с понедельника = 0
 * JavaScript getDay() возвращает 0 = воскресенье, нам нужно 0 = понедельник
 */
export function getMondayFirstWeekdayIndex(date: Date): number {
  const day = date.getDay();
  // Преобразуем: Вс(0)->6, Пн(1)->0, Вт(2)->1, ..., Сб(6)->5
  return day === 0 ? 6 : day - 1;
}

/**
 * Проверяет, является ли день выходным (Сб=5, Вс=6 по нашему индексу)
 */
export function isWeekend(weekdayIndex: number): boolean {
  return weekdayIndex === 5 || weekdayIndex === 6;
}

/**
 * Проверяет, является ли дата сегодняшним днем
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Форматирует дату в ISO формат YYYY-MM-DD
 */
export function formatDateISO(
  year: number,
  month: number,
  day: number,
): string {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

/**
 * Строит матрицу дней месяца (массив недель)
 * @param year - год
 * @param month - месяц (0-11)
 * @returns Матрица ячеек MonthCell[][]
 */
export function buildMonthMatrix(year: number, month: number): MonthMatrix {
  const today = new Date();
  const totalDays = daysInMonth(year, month);
  const firstDayDate = new Date(year, month, 1);
  const firstDayWeekdayIndex = getMondayFirstWeekdayIndex(firstDayDate);

  const matrix: MonthMatrix = [];
  let currentWeek: MonthCell[] = [];

  // Заполняем пустые ячейки в начале первой недели
  for (let i = 0; i < firstDayWeekdayIndex; i++) {
    currentWeek.push({
      day: null,
      isWeekend: false,
      isToday: false,
      date: null,
    });
  }

  // Заполняем дни месяца
  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(year, month, day);
    const weekdayIndex = getMondayFirstWeekdayIndex(currentDate);

    currentWeek.push({
      day,
      isWeekend: isWeekend(weekdayIndex),
      isToday: isSameDay(currentDate, today),
      date: formatDateISO(year, month, day),
    });

    // Если воскресенье (индекс 6), начинаем новую неделю
    if (weekdayIndex === 6) {
      matrix.push(currentWeek);
      currentWeek = [];
    }
  }

  // Добавляем последнюю неделю, если она не пустая
  if (currentWeek.length > 0) {
    // Дозаполняем пустыми ячейками до конца недели
    while (currentWeek.length < 7) {
      currentWeek.push({
        day: null,
        isWeekend: false,
        isToday: false,
        date: null,
      });
    }
    matrix.push(currentWeek);
  }

  return matrix;
}

/**
 * Получает название месяца на русском языке
 */
export function getMonthName(monthIndex: number): string {
  const date = new Date(2024, monthIndex, 1);
  const formatter = new Intl.DateTimeFormat("ru-RU", { month: "long" });
  const name = formatter.format(date);
  // Первая буква заглавная
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Строит данные всех 12 месяцев года
 */
export function buildYearCalendar(year: number): MonthData[] {
  const months: MonthData[] = [];

  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    months.push({
      monthIndex,
      name: getMonthName(monthIndex),
      year,
      matrix: buildMonthMatrix(year, monthIndex),
    });
  }

  return months;
}

/**
 * Валидирует год
 */
export function isValidYear(year: number, min: number, max: number): boolean {
  return Number.isInteger(year) && year >= min && year <= max;
}

/**
 * Возвращает текущий год
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Генерирует массив годов для бокового меню
 */
export function generateYearRange(start: number, end: number): number[] {
  const years: number[] = [];
  for (let year = start; year <= end; year++) {
    years.push(year);
  }
  return years;
}

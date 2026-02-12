/**
 * Российские праздники и памятные даты
 * Ключ — "MM-DD", значение — название праздника
 */

export interface Holiday {
  name: string;
  /** Официальный государственный праздник (выходной) */
  official: boolean;
}

/**
 * Праздники, привязанные к фиксированной дате (не зависят от года)
 */
export const FIXED_HOLIDAYS: Record<string, Holiday> = {
  // Январь
  "01-01": { name: "Новый год", official: true },
  "01-02": { name: "Новогодние каникулы", official: true },
  "01-03": { name: "Новогодние каникулы", official: true },
  "01-04": { name: "Новогодние каникулы", official: true },
  "01-05": { name: "Новогодние каникулы", official: true },
  "01-06": { name: "Новогодние каникулы", official: true },
  "01-07": { name: "Рождество Христово", official: true },
  "01-08": { name: "Новогодние каникулы", official: true },

  // Февраль
  "02-23": { name: "День защитника Отечества", official: true },

  // Март
  "03-08": { name: "Международный женский день", official: true },

  // Май
  "05-01": { name: "Праздник Весны и Труда", official: true },
  "05-09": { name: "День Победы", official: true },

  // Июнь
  "06-12": { name: "День России", official: true },

  // Ноябрь
  "11-04": { name: "День народного единства", official: true },
};

/**
 * Получить праздник для конкретной даты
 * @param month - месяц (0-11)
 * @param day - день месяца
 * @returns Holiday | null
 */
export function getHoliday(month: number, day: number): Holiday | null {
  const key = `${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return FIXED_HOLIDAYS[key] ?? null;
}

/**
 * Получить все праздники за конкретный месяц
 * @param month - месяц (0-11)
 * @returns Map<number, Holiday> — день -> праздник
 */
export function getMonthHolidays(month: number): Map<number, Holiday> {
  const result = new Map<number, Holiday>();
  const monthStr = String(month + 1).padStart(2, "0");

  for (const [key, holiday] of Object.entries(FIXED_HOLIDAYS)) {
    if (key.startsWith(monthStr + "-")) {
      const day = parseInt(key.split("-")[1], 10);
      result.set(day, holiday);
    }
  }

  return result;
}

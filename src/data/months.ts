/**
 * Месяцы для страниц вида /year/2026/yanvar.
 * Формы слова нужны в заголовках и текстах, Intl даёт только две из трёх.
 */
export interface MonthMeta {
  /** Индекс месяца (0-11) */
  index: number;
  /** Часть URL */
  slug: string;
  /** Именительный: «Январь» */
  nominative: string;
  /** Родительный: «января» — для дат */
  genitive: string;
  /** Предложный: «в январе» */
  prepositional: string;
}

/** Винительный падеж («календарь на январь») совпадает с именительным */
export function accusative(month: MonthMeta): string {
  return month.nominative.toLowerCase();
}

export const MONTHS: MonthMeta[] = [
  {
    index: 0,
    slug: "yanvar",
    nominative: "Январь",
    genitive: "января",
    prepositional: "январе",
  },
  {
    index: 1,
    slug: "fevral",
    nominative: "Февраль",
    genitive: "февраля",
    prepositional: "феврале",
  },
  {
    index: 2,
    slug: "mart",
    nominative: "Март",
    genitive: "марта",
    prepositional: "марте",
  },
  {
    index: 3,
    slug: "aprel",
    nominative: "Апрель",
    genitive: "апреля",
    prepositional: "апреле",
  },
  {
    index: 4,
    slug: "may",
    nominative: "Май",
    genitive: "мая",
    prepositional: "мае",
  },
  {
    index: 5,
    slug: "iyun",
    nominative: "Июнь",
    genitive: "июня",
    prepositional: "июне",
  },
  {
    index: 6,
    slug: "iyul",
    nominative: "Июль",
    genitive: "июля",
    prepositional: "июле",
  },
  {
    index: 7,
    slug: "avgust",
    nominative: "Август",
    genitive: "августа",
    prepositional: "августе",
  },
  {
    index: 8,
    slug: "sentyabr",
    nominative: "Сентябрь",
    genitive: "сентября",
    prepositional: "сентябре",
  },
  {
    index: 9,
    slug: "oktyabr",
    nominative: "Октябрь",
    genitive: "октября",
    prepositional: "октябре",
  },
  {
    index: 10,
    slug: "noyabr",
    nominative: "Ноябрь",
    genitive: "ноября",
    prepositional: "ноябре",
  },
  {
    index: 11,
    slug: "dekabr",
    nominative: "Декабрь",
    genitive: "декабря",
    prepositional: "декабре",
  },
];

/**
 * Годы, для которых генерируются страницы месяцев.
 * Ограничены годами с реальным спросом: без утверждённого календаря
 * месячная страница не даёт ничего сверх годовой.
 */
export const MONTH_PAGE_YEAR_START = 2022;
export const MONTH_PAGE_YEAR_END = 2027;

export const MONTH_PAGE_YEARS = Array.from(
  { length: MONTH_PAGE_YEAR_END - MONTH_PAGE_YEAR_START + 1 },
  (_, i) => MONTH_PAGE_YEAR_START + i,
);

export function monthPath(year: number, month: MonthMeta): string {
  return `/year/${year}/${month.slug}`;
}

export function hasMonthPage(year: number): boolean {
  return year >= MONTH_PAGE_YEAR_START && year <= MONTH_PAGE_YEAR_END;
}

export function getMonthBySlug(slug: string): MonthMeta | undefined {
  return MONTHS.find((m) => m.slug === slug);
}

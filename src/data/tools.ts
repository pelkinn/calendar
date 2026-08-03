/**
 * Каталог калькуляторов дат.
 * Один источник правды для роутинга, перелинковки, sitemap и хаба.
 */
export interface Tool {
  /** Путь без ведущего /kalkulyator */
  slug: string;
  /** H1 и заголовок в списках */
  title: string;
  /** Короткое описание для карточек и meta description */
  summary: string;
  /** Имя файла во views (без расширения) */
  view: string;
}

export const TOOLS: Tool[] = [
  {
    slug: "rabochie-dni",
    title: "Калькулятор рабочих дней",
    summary:
      "Считает рабочие дни за период по производственному календарю и норму часов при 40, 36 и 24-часовой неделе.",
    view: "WorkDaysTool",
  },
  {
    slug: "skolko-nedel-v-godu",
    title: "Сколько недель в году",
    summary:
      "Показывает количество недель в любом году по ISO 8601 и считает недели между двумя датами.",
    view: "WeeksInYearTool",
  },
  {
    slug: "kalkulyator-vremeni",
    title: "Калькулятор времени",
    summary:
      "Складывает и вычитает часы, минуты и секунды, переводит время в разные единицы.",
    view: "TimeCalcTool",
  },
  {
    slug: "sekundomer-tajmer",
    title: "Секундомер и таймер",
    summary:
      "Онлайн-секундомер с кругами и обратный таймер со звуковым сигналом — работают прямо в браузере.",
    view: "StopwatchTool",
  },
  {
    slug: "dney-mezhdu-datami",
    title: "Сколько дней между датами",
    summary:
      "Считает количество календарных, рабочих и выходных дней между двумя датами с учётом производственного календаря.",
    view: "DaysBetweenTool",
  },
  {
    slug: "data-cherez-dney",
    title: "Дата через N дней",
    summary:
      "Прибавляет или вычитает календарные и рабочие дни от выбранной даты — с учётом праздников и переносов выходных.",
    view: "AddDaysTool",
  },
  {
    slug: "vozrast",
    title: "Калькулятор возраста",
    summary:
      "Считает полный возраст в годах, месяцах и днях, а также общее количество прожитых дней и дату ближайшего дня рождения.",
    view: "AgeTool",
  },
  {
    slug: "nomer-nedeli",
    title: "Номер недели по дате",
    summary:
      "Определяет номер недели по ISO 8601, день недели, номер дня в году и квартал для любой даты.",
    view: "WeekNumberTool",
  },
];

export const TOOLS_BASE = "/kalkulyator";

export function toolPath(tool: Tool): string {
  return `${TOOLS_BASE}/${tool.slug}`;
}

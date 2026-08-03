<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import {
  buildYearCalendar,
  isValidYear,
  getCurrentYear,
  generateYearRange,
} from "@/utils/date";
import {
  MIN_YEAR,
  MAX_YEAR,
  SEO_YEAR_START,
  SEO_YEAR_END,
  isSeoYear,
} from "@/types/calendar";
import AppLayout from "@/components/AppLayout.vue";
import YearSelect from "@/components/YearSelect.vue";
import MonthGrid from "@/components/MonthGrid.vue";
import PrintIcon from "@/components/icons/PrintIcon.vue";
import HolidayIcon from "@/components/icons/HolidayIcon.vue";
import { useHolidays } from "@/composables/useHolidays";
import { getCalendarYears } from "@/composables/useProductionCalendar";
import { getYearMonths, sumWorkTime, formatHours } from "@/utils/workTime";
import { TOOLS, toolPath } from "@/data/tools";
import {
  HOLIDAY_PAGES,
  HOLIDAYS_BASE,
  holidayPath,
} from "@/data/holidayPages";
import { MONTHS, monthPath, hasMonthPage } from "@/data/months";
import { ARTICLES_BASE } from "@/data/articles";

const props = defineProps<{
  year: number;
}>();

const router = useRouter();
const { showHolidays, toggleHolidays } = useHolidays();

// Динамические мета-теги для SEO
useHead({
  title: computed(
    () =>
      `Производственный календарь на ${props.year} год — Праздники и выходные`,
  ),
  meta: [
    {
      name: "description",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год. Праздники, переносы выходных, сокращённые дни. Все месяцы на одной странице с печатью.`,
      ),
    },
    {
      name: "keywords",
      content: computed(
        () =>
          `производственный календарь ${props.year}, календарь ${props.year}, праздники ${props.year}, выходные дни ${props.year}, перенос выходных ${props.year}`,
      ),
    },
    // Open Graph
    {
      property: "og:title",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год — Праздники и выходные`,
      ),
    },
    {
      property: "og:description",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год. Праздники, переносы выходных, сокращённые дни.`,
      ),
    },
    {
      property: "og:url",
      content: computed(
        () => `https://calendar-online.online/year/${props.year}`,
      ),
    },
    // Twitter Card
    {
      name: "twitter:title",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год — Праздники и выходные`,
      ),
    },
    {
      name: "twitter:description",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год. Праздники, переносы выходных, сокращённые дни.`,
      ),
    },
  ],
  link: [
    {
      rel: "canonical",
      href: computed(() => `https://calendar-online.online/year/${props.year}`),
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Производственный календарь на ${props.year} год`,
          description: `Производственный календарь на ${props.year} год. Праздники, переносы выходных, сокращённые рабочие дни России.`,
          url: `https://calendar-online.online/year/${props.year}`,
          inLanguage: "ru",
          publisher: {
            "@type": "Organization",
            name: "Производственный календарь онлайн",
            url: "https://calendar-online.online",
          },
        }),
      ),
    },
  ],
});

// Проверяем валидность года, если невалиден — редирект
watch(
  () => props.year,
  (newYear) => {
    if (!isValidYear(newYear, MIN_YEAR, MAX_YEAR) || isNaN(newYear)) {
      router.replace(`/year/${getCurrentYear()}`);
    }
  },
  { immediate: true },
);

// Данные календаря
const calendarMonths = computed(() => {
  if (!isValidYear(props.year, MIN_YEAR, MAX_YEAR)) {
    return [];
  }
  return buildYearCalendar(props.year);
});

// Заголовок
const pageTitle = computed(
  () => `Производственный календарь на ${props.year} год`,
);
const pageTitleShort = computed(() => `${props.year} год`);

// Перелинковка: соседние годы и полный список пре-рендеренных годов
const prevYear = computed(() =>
  isSeoYear(props.year - 1) ? props.year - 1 : null,
);
const nextYear = computed(() =>
  isSeoYear(props.year + 1) ? props.year + 1 : null,
);
const seoYears = computed(() =>
  generateYearRange(SEO_YEAR_START, SEO_YEAR_END),
);
// Норма рабочего времени есть только там, где загружен производственный календарь
const hasNormPage = computed(() => getCalendarYears().includes(props.year));

/**
 * Сводка года для шапки. Считается по тем же данным, что и страница норм,
 * поэтому существует только для годов с производственным календарём.
 */
const summary = computed(() => {
  if (!hasNormPage.value) return null;
  const total = sumWorkTime(getYearMonths(props.year));
  return {
    workDays: total.workDays,
    restDays: total.restDays,
    hours: formatHours(total.hours[40]),
    shortenedDays: total.shortenedDays,
  };
});

// Печать
const handlePrint = () => {
  window.print();
};

const holidaysTitle = computed(() =>
  showHolidays.value ? "Скрыть праздники" : "Показать праздники",
);
</script>

<template>
  <AppLayout width="wide">
    <template #header-actions>
      <YearSelect :current-year="year" />
      <button
        class="holiday-toggle"
        :class="{ active: showHolidays }"
        @click="toggleHolidays"
        :title="holidaysTitle"
        aria-label="Переключить отображение праздников"
      >
        <HolidayIcon :active="showHolidays" />
      </button>
      <button
        class="print-button"
        @click="handlePrint"
        title="Печать календаря"
      >
        <PrintIcon />
        <span>Печать</span>
      </button>
    </template>

    <template #page-header>
      <header class="hero">
        <div class="hero__glow" aria-hidden="true"></div>
        <div class="hero__grid" aria-hidden="true"></div>

        <div class="hero__inner">
          <p class="hero__eyebrow">
            <i aria-hidden="true"></i>
            По постановлениям Правительства России
          </p>
          <h1 class="hero__title">
            <span class="title-full">{{ pageTitle }}</span>
            <span class="title-short">Календарь на {{ pageTitleShort }}</span>
          </h1>
          <p class="hero__lead">
            Праздники, переносы выходных и сокращённые дни. Норма часов
            посчитана по методике Минтруда.
          </p>

          <div v-if="summary" class="stats">
            <div class="stat stat--work">
              <span class="stat__value">{{ summary.workDays }}</span>
              <span class="stat__label">рабочих дней</span>
            </div>
            <div class="stat stat--rest">
              <span class="stat__value">{{ summary.restDays }}</span>
              <span class="stat__label">выходных и праздничных</span>
            </div>
            <div class="stat stat--hours">
              <span class="stat__value">
                {{ summary.hours }}<small>ч</small>
              </span>
              <span class="stat__label">норма при 40-часовой неделе</span>
            </div>
            <div class="stat stat--short">
              <span class="stat__value">{{ summary.shortenedDays }}</span>
              <span class="stat__label">сокращённых дня</span>
            </div>
          </div>
        </div>
      </header>
    </template>

    <div class="grid-head">
      <h2 class="grid-head__title">Календарь на год</h2>
      <div class="calendar-legend">
        <span class="legend-item legend-item--holiday">
          <i class="legend-sample">8</i>
          Выходной и праздник
        </span>
        <span class="legend-item legend-item--shortened">
          <i class="legend-sample">30</i>
          Сокращённый
        </span>
        <span class="legend-item legend-item--today">
          <i class="legend-sample">12</i>
          Сегодня
        </span>
        <span class="legend-item legend-item--selected">
          <i class="legend-sample">5</i>
          Выбранная дата
        </span>
      </div>
    </div>

    <MonthGrid :months="calendarMonths" />

    <!-- Перелинковка: списки по разделам вместо ковра одинаковых чипов -->
    <nav class="year-nav" aria-label="Разделы и календари по годам">
      <div class="year-nav__siblings">
        <RouterLink
          v-if="prevYear"
          class="year-nav__sibling"
          :to="`/year/${prevYear}`"
        >
          <span class="year-nav__arrow" aria-hidden="true">←</span>
          Календарь на {{ prevYear }} год
        </RouterLink>
        <span v-else></span>
        <RouterLink
          v-if="nextYear"
          class="year-nav__sibling year-nav__sibling--next"
          :to="`/year/${nextYear}`"
        >
          Календарь на {{ nextYear }} год
          <span class="year-nav__arrow" aria-hidden="true">→</span>
        </RouterLink>
      </div>

      <div class="year-nav__cols">
        <div class="year-nav__col reveal">
          <h2 class="year-nav__title">Норма времени</h2>
          <ul class="year-nav__list">
            <li v-if="hasNormPage">
              <RouterLink class="year-nav__link" :to="`/norma/${year}`">
                Норма на {{ year }} год
              </RouterLink>
            </li>
            <li>
              <RouterLink class="year-nav__link" to="/norma">
                Норма по всем годам
              </RouterLink>
            </li>
            <li>
              <RouterLink class="year-nav__link" :to="ARTICLES_BASE">
                Статьи о рабочем времени
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="year-nav__col reveal">
          <h2 class="year-nav__title">Праздники</h2>
          <ul class="year-nav__list">
            <li>
              <RouterLink class="year-nav__link" :to="HOLIDAYS_BASE">
                Все праздники России
              </RouterLink>
            </li>
            <li v-for="holiday in HOLIDAY_PAGES" :key="holiday.slug">
              <RouterLink class="year-nav__link" :to="holidayPath(holiday)">
                {{ holiday.name }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="year-nav__col reveal">
          <h2 class="year-nav__title">Калькуляторы</h2>
          <ul class="year-nav__list">
            <li v-for="tool in TOOLS" :key="tool.slug">
              <RouterLink class="year-nav__link" :to="toolPath(tool)">
                {{ tool.title }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div v-if="hasMonthPage(year)" class="year-nav__col reveal">
          <h2 class="year-nav__title">Месяцы {{ year }} года</h2>
          <ul class="year-nav__list year-nav__list--split">
            <li v-for="month in MONTHS" :key="month.slug">
              <RouterLink class="year-nav__link" :to="monthPath(year, month)">
                {{ month.nominative }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="year-strip">
        <span class="year-strip__label">Другие годы</span>
        <div class="year-strip__list">
          <RouterLink
            v-for="y in seoYears"
            :key="y"
            class="year-strip__link"
            :class="{ 'is-current': y === year }"
            :to="`/year/${y}`"
            :title="`Производственный календарь на ${y} год`"
          >
            {{ y }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <section class="seo-text">
      <h2>Производственный календарь на {{ year }} год</h2>
      <p>
        Производственный календарь на {{ year }} год учитывает все официальные
        государственные праздники России, переносы выходных дней и сокращённые
        рабочие дни, утверждённые Правительством Российской Федерации.
      </p>
      <h3>Государственные праздники России</h3>
      <p>
        В {{ year }} году установлены следующие нерабочие праздничные дни: 1–8
        января — Новогодние каникулы и Рождество Христово, 23 февраля — День
        защитника Отечества, 8 марта — Международный женский день, 1 мая —
        Праздник Весны и Труда, 9 мая — День Победы, 12 июня — День России,
        4 ноября — День народного единства.
      </p>
      <h3>Переносы выходных и сокращённые дни</h3>
      <p>
        Когда праздничный день совпадает с выходным (субботой или
        воскресеньем), выходной переносится на ближайший рабочий день.
        Правительство России ежегодно публикует постановление с точными датами
        переносов. Сокращённые рабочие дни (на 1 час) устанавливаются
        накануне большинства государственных праздников.
      </p>
      <h3>Как пользоваться календарём</h3>
      <p>
        Нужный год выбирается в шапке сайта — доступны годы с 1900 по 2100.
        Выходные и праздничные дни выделены красным, сокращённые
        предпраздничные — янтарным с чертой под числом. Наведите курсор на
        дату, чтобы увидеть название праздника. Для печати воспользуйтесь
        кнопкой «Печать» — календарь оптимизирован для формата А4.
      </p>
    </section>
  </AppLayout>
</template>

<style scoped>
/* ===== Шапка страницы: сводка года ===== */
.hero {
  position: relative;
  overflow: hidden;
  padding: 52px 32px 38px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

.hero__glow {
  position: absolute;
  inset: -40% -10% auto -10%;
  height: 320px;
  pointer-events: none;
  background: radial-gradient(
    60% 100% at 22% 0%,
    var(--color-primary-subtle),
    transparent 70%
  );
}

/* Уезжающая сетка: единственное фоновое движение на странице */
.hero__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    linear-gradient(var(--color-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-border) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(70% 90% at 30% 0%, #000, transparent 72%);
  mask-image: radial-gradient(70% 90% at 30% 0%, #000, transparent 72%);
  animation: hero-drift 26s linear infinite;
}

@keyframes hero-drift {
  to {
    background-position:
      56px 56px,
      56px 56px;
  }
}

.hero__inner {
  position: relative;
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78125rem;
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.hero__eyebrow i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--color-primary);
  animation: hero-pulse 2.6s var(--ease) infinite;
}

@keyframes hero-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.35;
    transform: scale(0.8);
  }
}

.hero__title {
  font-size: clamp(1.75rem, 3.4vw, 2.625rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  color: var(--color-text);
}

.title-short {
  display: none;
}

.hero__lead {
  color: var(--color-text-muted);
  margin: 12px 0 0;
  max-width: 52ch;
  font-size: 0.9375rem;
}

/* Сводка: числа разделены линиями, без карточек */
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-top: 36px;
  border-top: 1px solid var(--color-border);
}

.stat {
  padding: 20px 22px 0;
  border-right: 1px solid var(--color-border);
}

.stat:first-child {
  padding-left: 0;
}

.stat:last-child {
  border-right: 0;
}

.stat__value {
  display: block;
  font-size: clamp(1.875rem, 3.6vw, 2.625rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.stat__value small {
  font-size: 0.45em;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: -0.01em;
  margin-left: 3px;
}

.stat__label {
  display: block;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  margin-top: 9px;
}

.stat--rest .stat__value {
  color: var(--color-weekend);
}

.stat--hours .stat__value {
  color: var(--color-primary);
}

.stat--short .stat__value {
  color: var(--color-holiday);
}

/* ===== Заголовок сетки и легенда ===== */
.grid-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
  padding: 36px 32px 18px;
}

.grid-head__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.calendar-legend {
  margin-left: auto;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78125rem;
  color: var(--color-text-muted);
}

.legend-sample {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  font-size: 0.625rem;
  font-weight: 600;
  font-style: normal;
  font-variant-numeric: tabular-nums;
}

.legend-item--holiday .legend-sample {
  color: var(--color-holiday-official);
  background-color: var(--color-holiday-active-bg);
}

.legend-item--shortened .legend-sample {
  color: var(--color-holiday);
  background-color: var(--color-shortened-bg);
  box-shadow: inset 0 -2px 0 var(--color-holiday);
}

.legend-item--today .legend-sample {
  background-color: var(--color-today-bg);
  color: var(--color-today-text);
}

.legend-item--selected .legend-sample {
  background-color: var(--color-selected-bg);
  color: var(--color-selected-text);
}

/* ===== Перелинковка ===== */
.year-nav {
  padding: 40px 32px 0;
  margin-top: 40px;
  border-top: 1px solid var(--color-border);
}

.year-nav__siblings {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 36px;
}

.year-nav__sibling {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 15px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition:
    border-color 0.16s var(--ease),
    transform 0.16s var(--ease);
}

.year-nav__sibling:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}

.year-nav__arrow {
  color: var(--color-text-faint);
  transition: transform 0.18s var(--ease);
}

.year-nav__sibling:hover .year-nav__arrow {
  transform: translateX(-3px);
}

.year-nav__sibling--next:hover .year-nav__arrow {
  transform: translateX(3px);
}

.year-nav__cols {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 32px;
}

.year-nav__title {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  margin: 0 0 14px;
}

.year-nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.year-nav__list--split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 16px;
}

/* Стрелка выезжает при наведении — подсказка, что это переход, а не тег */
.year-nav__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text);
  text-decoration: none;
  transition:
    color 0.16s var(--ease),
    padding-left 0.18s var(--ease);
}

.year-nav__link::after {
  content: "→";
  color: var(--color-primary);
  opacity: 0;
  transform: translateX(-5px);
  transition:
    opacity 0.18s var(--ease),
    transform 0.18s var(--ease);
}

.year-nav__link:hover {
  color: var(--color-primary);
  padding-left: 5px;
}

.year-nav__link:hover::after {
  opacity: 1;
  transform: translateX(0);
}

.year-strip {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 34px;
}

.year-strip__label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}

.year-strip__list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.year-strip__link {
  padding: 5px 11px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
  text-decoration: none;
  transition:
    color 0.16s var(--ease),
    border-color 0.16s var(--ease);
}

.year-strip__link:hover {
  color: var(--color-text);
  border-color: var(--color-border);
}

.year-strip__link.is-current {
  color: var(--color-primary);
  border-color: var(--color-primary);
  font-weight: 600;
}

/* ===== Кнопки в шапке сайта ===== */
.holiday-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--color-text-muted);
  transition:
    color 0.16s var(--ease),
    border-color 0.16s var(--ease),
    transform 0.16s var(--ease);
}

.holiday-toggle:hover {
  color: var(--color-text);
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}

/* Тумблер включён по умолчанию. Состояние читается формой звезды
   (залита или контур), поэтому сигнальный цвет тут не нужен */
.holiday-toggle.active {
  color: var(--color-text);
  border-color: var(--color-border-strong);
}

.print-button {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  padding: 0 13px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--color-text);
  font-size: 0.84375rem;
  font-weight: 500;
  transition:
    border-color 0.16s var(--ease),
    transform 0.16s var(--ease);
}

.print-button:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}

/* ===== SEO-текст ===== */
.seo-text {
  padding: 44px 32px 8px;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.75;
}

.seo-text h2 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}

.seo-text h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 22px 0 8px;
}

.seo-text p {
  margin: 0 0 8px;
  max-width: 76ch;
}

/* ===== Печать ===== */
@media print {
  .hero__glow,
  .hero__grid,
  .year-nav,
  .grid-head {
    display: none;
  }

  .hero {
    padding: 0 0 12px;
    border-bottom: 0;
  }
}

/* ===== Адаптив ===== */
@media (max-width: 1180px) {
  .year-nav__cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .hero {
    padding: 34px 24px 26px;
  }

  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stat {
    padding: 18px 18px 18px;
    border-bottom: 1px solid var(--color-border);
  }

  .stat:nth-child(odd) {
    padding-left: 0;
  }

  .stat:nth-child(2n) {
    border-right: 0;
  }

  .grid-head {
    padding: 26px 16px 14px;
  }

  .year-nav,
  .seo-text {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 28px 16px 22px;
  }

  .title-full {
    display: none;
  }

  .title-short {
    display: inline;
  }

  .print-button span {
    display: none;
  }

  .print-button {
    padding: 0 11px;
  }

  .year-nav__siblings {
    flex-direction: column;
  }

  .year-nav__sibling {
    justify-content: center;
  }

  .calendar-legend {
    margin-left: 0;
    width: 100%;
    gap: 10px 14px;
  }
}

@media (max-width: 560px) {
  .year-nav__cols {
    grid-template-columns: 1fr;
    gap: 26px;
  }
}
</style>

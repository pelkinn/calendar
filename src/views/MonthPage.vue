<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import AppLayout from "@/components/AppLayout.vue";
import AppBreadcrumbs from "@/components/AppBreadcrumbs.vue";
import {
  MONTHS,
  MONTH_PAGE_YEARS,
  monthPath,
  hasMonthPage,
  accusative,
  type MonthMeta,
} from "@/data/months";
import { buildMonthMatrix, daysInMonth, getCurrentYear } from "@/utils/date";
import { getMonthWorkTime } from "@/utils/workTime";
import { formatHours } from "@/utils/workTime";
import {
  getCalendarYears,
  getMonthCalendarData,
} from "@/composables/useProductionCalendar";
import { getMonthHolidays } from "@/data/holidays";
import { plural } from "@/utils/dateCalc";
import { HOLIDAYS_BASE } from "@/data/holidayPages";
import { TOOLS, toolPath } from "@/data/tools";
import MonthCard from "@/components/MonthCard.vue";

const props = defineProps<{
  year: number;
  month: MonthMeta;
}>();

const currentYear = getCurrentYear();

const monthData = computed(() => ({
  monthIndex: props.month.index,
  name: props.month.nominative,
  year: props.year,
  matrix: buildMonthMatrix(props.year, props.month.index),
}));

const workTime = computed(() => getMonthWorkTime(props.year, props.month.index));

// Страницы норм есть только там, где утверждён производственный календарь
const hasNormPage = computed(() => getCalendarYears().includes(props.year));

const calendarData = computed(() =>
  getMonthCalendarData(props.year, props.month.index),
);

/** Нерабочие дни месяца списком: «1, 2, 3, 7, 8…» */
const restDaysList = computed(() =>
  calendarData.value
    ? [...calendarData.value.nonWorkingDays].sort((a, b) => a - b)
    : [],
);

const shortenedList = computed(() =>
  calendarData.value
    ? [...calendarData.value.shortenedDays].sort((a, b) => a - b)
    : [],
);

/** Официальные праздники месяца */
const holidays = computed(() => {
  const map = getMonthHolidays(props.month.index);
  return [...map.entries()]
    .map(([day, holiday]) => ({ day, holiday }))
    .sort((a, b) => a.day - b.day);
});

const prevMonth = computed(() => {
  const index = props.month.index - 1;
  if (index < 0)
    return hasMonthPage(props.year - 1)
      ? { year: props.year - 1, meta: MONTHS[11] }
      : null;
  return { year: props.year, meta: MONTHS[index] };
});

const nextMonth = computed(() => {
  const index = props.month.index + 1;
  if (index > 11)
    return hasMonthPage(props.year + 1)
      ? { year: props.year + 1, meta: MONTHS[0] }
      : null;
  return { year: props.year, meta: MONTHS[index] };
});

/** Тот же месяц в других годах — перелинковка по вертикали */
const sameMonthOtherYears = computed(() =>
  MONTH_PAGE_YEARS.filter((y) => y !== props.year),
);

const monthAccusative = computed(() => accusative(props.month));

const title = computed(
  () =>
    `Производственный календарь на ${monthAccusative.value} ${props.year} года`,
);

const description = computed(() => {
  const wt = workTime.value;
  if (!wt) {
    return `Календарь на ${monthAccusative.value} ${props.year} года: рабочие дни, выходные и праздники, недели по дням.`;
  }
  return `Производственный календарь на ${monthAccusative.value} ${props.year} года: ${wt.workDays} рабочих ${plural(wt.workDays, ["день", "дня", "дней"])}, ${wt.restDays} выходных и праздничных, норма ${formatHours(wt.hours[40])} ${plural(wt.hours[40], ["час", "часа", "часов"])} при 40-часовой неделе.`;
});

const canonical = computed(
  () =>
    `https://calendar-online.online${monthPath(props.year, props.month)}`,
);

useHead({
  title: computed(
    () =>
      `Календарь на ${monthAccusative.value} ${props.year} — рабочие дни и праздники`,
  ),
  meta: [
    { name: "description", content: description },
    {
      name: "keywords",
      content: computed(
        () =>
          `календарь ${monthAccusative.value} ${props.year}, ${monthAccusative.value} ${props.year} рабочие дни, праздники в ${props.month.prepositional} ${props.year}, производственный календарь ${monthAccusative.value} ${props.year}`,
      ),
    },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ],
  link: [{ rel: "canonical", href: canonical }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title.value,
          description: description.value,
          url: canonical.value,
          inLanguage: "ru",
          isPartOf: {
            "@type": "WebPage",
            name: `Производственный календарь на ${props.year} год`,
            url: `https://calendar-online.online/year/${props.year}`,
          },
        }),
      ),
    },
  ],
});

const crumbs = computed(() => [
  { label: "Календарь", to: `/year/${currentYear}` },
  { label: `${props.year} год`, to: `/year/${props.year}` },
  { label: props.month.nominative },
]);
</script>

<template>
  <AppLayout width="narrow">
    <template #page-header>
      <AppBreadcrumbs :items="crumbs" />
    </template>

    <h1>{{ title }}</h1>
    <p class="lead">{{ description }}</p>

    <div class="month-layout">
      <div class="month-card-wrap">
        <MonthCard :month="monthData" />
      </div>

      <div v-if="workTime" class="month-stats">
        <div class="stat">
          <span class="stat__value">{{ workTime.workDays }}</span>
          <span class="stat__label">рабочих дней</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ workTime.restDays }}</span>
          <span class="stat__label">выходных и праздничных</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ formatHours(workTime.hours[40]) }}</span>
          <span class="stat__label">часов при 40-часовой неделе</span>
        </div>
        <div class="stat">
          <span class="stat__value">{{ daysInMonth(year, month.index) }}</span>
          <span class="stat__label">календарных дней</span>
        </div>
      </div>
    </div>

    <section v-if="workTime" class="table-block">
      <h2>
        Норма рабочего времени в {{ month.prepositional }} {{ year }} года
      </h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Рабочая неделя</th>
              <th>Норма часов</th>
              <th>Рабочих дней</th>
              <th>Сокращённых дней</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in [40, 36, 24] as const" :key="w">
              <td>{{ w }} часов</td>
              <td>{{ formatHours(workTime.hours[w]) }}</td>
              <td>{{ workTime.workDays }}</td>
              <td>{{ workTime.shortenedDays }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="text-block">
      <h2>Выходные и праздничные дни</h2>
      <p v-if="restDaysList.length">
        Нерабочие дни в {{ month.prepositional }} {{ year }} года:
        {{ restDaysList.join(", ") }} —
        всего {{ restDaysList.length }}
        {{ plural(restDaysList.length, ["день", "дня", "дней"]) }}.
      </p>
      <p v-else>
        Производственный календарь на {{ year }} год ещё не утверждён, поэтому
        выходные показаны по стандартной пятидневной неделе.
      </p>

      <p v-if="shortenedList.length">
        Сокращённые на один час предпраздничные дни:
        {{ shortenedList.join(", ") }} {{ month.genitive }}.
      </p>

      <template v-if="holidays.length">
        <h2>Праздники в {{ month.prepositional }}</h2>
        <ul class="holiday-list">
          <li v-for="item in holidays" :key="item.day">
            <strong>{{ item.day }} {{ month.genitive }}</strong> —
            {{ item.holiday.name }}
            <span v-if="item.holiday.official" class="badge">выходной</span>
          </li>
        </ul>
      </template>

      <h2>Как считать рабочие дни</h2>
      <p>
        Данные взяты из производственного календаря России: учтены
        государственные праздники, перенесённые Правительством выходные и
        сокращённые предпраздничные дни. Норма часов рассчитана по методике
        приказа Минздравсоцразвития от 13.08.2009 № 588н.
      </p>
    </section>

    <nav class="page-nav" aria-label="Навигация по месяцам">
      <div class="siblings">
        <RouterLink
          v-if="prevMonth"
          class="sibling"
          :to="monthPath(prevMonth.year, prevMonth.meta)"
        >
          ← {{ prevMonth.meta.nominative }} {{ prevMonth.year }}
        </RouterLink>
        <span v-else></span>
        <RouterLink
          v-if="nextMonth"
          class="sibling"
          :to="monthPath(nextMonth.year, nextMonth.meta)"
        >
          {{ nextMonth.meta.nominative }} {{ nextMonth.year }} →
        </RouterLink>
      </div>

      <h2>Месяцы {{ year }} года</h2>
      <ul class="chips">
        <li v-for="m in MONTHS" :key="m.slug">
          <RouterLink
            :to="monthPath(year, m)"
            :class="{ 'is-current': m.index === month.index }"
          >
            {{ m.nominative }}
          </RouterLink>
        </li>
      </ul>

      <h2>{{ month.nominative }} в других годах</h2>
      <ul class="chips">
        <li v-for="y in sameMonthOtherYears" :key="y">
          <RouterLink :to="monthPath(y, month)">
            {{ month.nominative }} {{ y }}
          </RouterLink>
        </li>
      </ul>

      <h2>Смотрите также</h2>
      <ul class="chips">
        <li>
          <RouterLink :to="`/year/${year}`">
            Календарь на {{ year }} год
          </RouterLink>
        </li>
        <li v-if="hasNormPage">
          <RouterLink :to="`/norma/${year}`">
            Норма рабочего времени {{ year }}
          </RouterLink>
        </li>
        <li v-else>
          <RouterLink to="/norma">Норма рабочего времени по годам</RouterLink>
        </li>
        <li>
          <RouterLink :to="HOLIDAYS_BASE">Праздники России</RouterLink>
        </li>
        <li v-for="tool in TOOLS" :key="tool.slug">
          <RouterLink :to="toolPath(tool)">{{ tool.title }}</RouterLink>
        </li>
      </ul>
    </nav>
  </AppLayout>
</template>

<style scoped>
h1 {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0 0 10px;
}

.lead {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  line-height: 1.7;
  margin: 0 0 28px;
}

.month-layout {
  display: grid;
  grid-template-columns: minmax(260px, 320px) 1fr;
  gap: 20px;
  align-items: start;
  margin-bottom: 32px;
}

.month-card-wrap {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
}

.month-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 16px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.stat__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.1;
}

.stat__label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.table-block {
  margin-bottom: 32px;
}

.table-block h2,
.text-block h2,
.page-nav h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}

.text-block h2 {
  margin-top: 22px;
}

.table-scroll {
  overflow-x: auto;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th,
.data-table td {
  padding: 9px 14px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.data-table thead th {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background-color: var(--color-bg-secondary);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.text-block {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.7;
  margin-bottom: 28px;
}

.text-block p {
  margin: 0 0 10px;
}

.holiday-list {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.holiday-list strong {
  color: var(--color-text);
}

.badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 7px;
  border-radius: 10px;
  background-color: var(--color-holiday-active-bg);
  color: var(--color-holiday-official);
  font-size: 0.6875rem;
  font-weight: 600;
}

.siblings {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
}

.sibling {
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.15s ease;
}

.sibling:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
}

.chips a {
  display: inline-block;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  text-decoration: none;
  transition: all 0.15s ease;
}

.chips a:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.chips a.is-current {
  background-color: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.375rem;
  }

  .month-layout {
    grid-template-columns: 1fr;
  }

  .siblings {
    flex-direction: column;
  }

  .sibling {
    text-align: center;
  }
}
</style>

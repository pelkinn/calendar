<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import { getMonthName } from "@/utils/date";
import { getCalendarYears } from "@/composables/useProductionCalendar";
import {
  getYearMonths,
  getQuarterWorkTime,
  getHalfYearWorkTime,
  sumWorkTime,
  formatHours,
  WEEK_HOURS,
  type WeekHours,
} from "@/utils/workTime";
import { TOOLS, toolPath } from "@/data/tools";
import AppLayout from "@/components/AppLayout.vue";
import YearSelect from "@/components/YearSelect.vue";
import PrintIcon from "@/components/icons/PrintIcon.vue";

const props = defineProps<{
  year: number;
}>();

const normYears = getCalendarYears();

const months = computed(() => getYearMonths(props.year));
const yearTotal = computed(() => sumWorkTime(months.value));
const quarters = computed(() =>
  [1, 2, 3, 4].map((q) => ({
    quarter: q,
    stats: getQuarterWorkTime(months.value, q),
  })),
);
const halves = computed(() =>
  [1, 2].map((h) => ({
    half: h,
    stats: getHalfYearWorkTime(months.value, h),
  })),
);

const hasData = computed(() => months.value.length === 12);

const prevYear = computed(() =>
  normYears.includes(props.year - 1) ? props.year - 1 : null,
);
const nextYear = computed(() =>
  normYears.includes(props.year + 1) ? props.year + 1 : null,
);

const title = computed(
  () => `Норма рабочего времени на ${props.year} год`,
);
const description = computed(
  () =>
    `Норма рабочего времени на ${props.year} год при 40, 36 и 24-часовой рабочей неделе: по месяцам, кварталам и полугодиям. Количество рабочих дней — ${yearTotal.value.workDays}, норма часов — ${formatHours(yearTotal.value.hours[40])}.`,
);
const canonical = computed(
  () => `https://calendar-online.online/norma/${props.year}`,
);

useHead({
  title: computed(
    () => `Норма рабочего времени на ${props.year} год — часы по месяцам`,
  ),
  meta: [
    { name: "description", content: description },
    {
      name: "keywords",
      content: computed(
        () =>
          `норма рабочего времени ${props.year}, норма часов ${props.year}, рабочие дни ${props.year}, баланс рабочего времени ${props.year}, 36-часовая неделя ${props.year}`,
      ),
    },
    {
      property: "og:title",
      content: computed(() => `Норма рабочего времени на ${props.year} год`),
    },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    {
      name: "twitter:title",
      content: computed(() => `Норма рабочего времени на ${props.year} год`),
    },
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

const handlePrint = () => window.print();

const weekHoursList = WEEK_HOURS as readonly WeekHours[];
</script>

<template>
  <AppLayout width="wide">
    <template #header-actions>
      <YearSelect
        :current-year="year"
        link-prefix="/norma"
        :years="normYears"
      />
      <button class="icon-button" @click="handlePrint" title="Печать">
        <PrintIcon />
      </button>
    </template>

    <template #page-header>
      <div class="norm-header">
        <h1 class="norm-title">{{ title }}</h1>
      </div>
    </template>

    <div class="norm-content">
      <template v-if="hasData">
        <!-- Сводка за год -->
        <section class="summary">
          <div class="summary-card">
            <span class="summary-value">{{ yearTotal.workDays }}</span>
            <span class="summary-label">рабочих дней</span>
          </div>
          <div class="summary-card">
            <span class="summary-value">{{ yearTotal.restDays }}</span>
            <span class="summary-label">выходных и праздничных</span>
          </div>
          <div class="summary-card">
            <span class="summary-value">
              {{ formatHours(yearTotal.hours[40]) }}
            </span>
            <span class="summary-label">часов при 40-часовой неделе</span>
          </div>
          <div class="summary-card">
            <span class="summary-value">{{ yearTotal.shortenedDays }}</span>
            <span class="summary-label">сокращённых дней</span>
          </div>
        </section>

        <!-- По месяцам -->
        <section class="table-block">
          <h2>Норма рабочего времени по месяцам {{ year }} года</h2>
          <div class="table-scroll">
            <table class="norm-table">
              <thead>
                <tr>
                  <th rowspan="2" class="col-name">Месяц</th>
                  <th rowspan="2">Кал. дни</th>
                  <th rowspan="2">Раб. дни</th>
                  <th rowspan="2">Вых. и праздн.</th>
                  <th :colspan="weekHoursList.length">
                    Норма часов при неделе
                  </th>
                </tr>
                <tr>
                  <th v-for="w in weekHoursList" :key="w">{{ w }} ч</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(m, i) in months" :key="m.monthIndex">
                  <tr>
                    <td class="col-name">
                      {{ getMonthName(m.monthIndex) }}
                    </td>
                    <td>{{ m.calendarDays }}</td>
                    <td>{{ m.workDays }}</td>
                    <td>{{ m.restDays }}</td>
                    <td v-for="w in weekHoursList" :key="w">
                      {{ formatHours(m.hours[w]) }}
                    </td>
                  </tr>
                  <!-- Итог квартала после каждого третьего месяца -->
                  <tr v-if="(i + 1) % 3 === 0" class="row-total">
                    <td class="col-name">
                      {{ (i + 1) / 3 }} квартал
                    </td>
                    <td>{{ quarters[(i + 1) / 3 - 1].stats!.calendarDays }}</td>
                    <td>{{ quarters[(i + 1) / 3 - 1].stats!.workDays }}</td>
                    <td>{{ quarters[(i + 1) / 3 - 1].stats!.restDays }}</td>
                    <td v-for="w in weekHoursList" :key="w">
                      {{ formatHours(quarters[(i + 1) / 3 - 1].stats!.hours[w]) }}
                    </td>
                  </tr>
                </template>
                <tr class="row-total row-year">
                  <td class="col-name">{{ year }} год</td>
                  <td>{{ yearTotal.calendarDays }}</td>
                  <td>{{ yearTotal.workDays }}</td>
                  <td>{{ yearTotal.restDays }}</td>
                  <td v-for="w in weekHoursList" :key="w">
                    {{ formatHours(yearTotal.hours[w]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- По полугодиям -->
        <section class="table-block">
          <h2>Норма рабочего времени по полугодиям</h2>
          <div class="table-scroll">
            <table class="norm-table">
              <thead>
                <tr>
                  <th class="col-name">Период</th>
                  <th>Кал. дни</th>
                  <th>Раб. дни</th>
                  <th>Вых. и праздн.</th>
                  <th v-for="w in weekHoursList" :key="w">{{ w }} ч</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="h in halves" :key="h.half">
                  <td class="col-name">{{ h.half }} полугодие</td>
                  <td>{{ h.stats!.calendarDays }}</td>
                  <td>{{ h.stats!.workDays }}</td>
                  <td>{{ h.stats!.restDays }}</td>
                  <td v-for="w in weekHoursList" :key="w">
                    {{ formatHours(h.stats!.hours[w]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Методика -->
        <section class="seo-text">
          <h2>Как считается норма рабочего времени</h2>
          <p>
            Норма рабочего времени рассчитывается по методике, утверждённой
            приказом Минздравсоцразвития России от 13.08.2009 № 588н:
            продолжительность рабочей недели делится на пять дней и умножается
            на количество рабочих дней в периоде. Из полученного результата
            вычитается по одному часу за каждый предпраздничный день, когда
            рабочий день сокращается (статья 95 ТК РФ).
          </p>
          <p>
            В {{ year }} году при 40-часовой рабочей неделе норма составляет
            {{ formatHours(yearTotal.hours[40]) }} ч, при 36-часовой —
            {{ formatHours(yearTotal.hours[36]) }} ч, при 24-часовой —
            {{ formatHours(yearTotal.hours[24]) }} ч. Расчёт учитывает
            {{ yearTotal.workDays }} рабочих дней,
            {{ yearTotal.restDays }} выходных и нерабочих праздничных дней и
            {{ yearTotal.shortenedDays }} сокращённых предпраздничных дня.
          </p>
          <h3>Кому положена сокращённая рабочая неделя</h3>
          <p>
            36-часовая неделя установлена для работников, занятых на работах с
            вредными условиями труда 3 или 4 степени, педагогических
            работников, инвалидов I и II групп. 24-часовая неделя — для
            работников в возрасте до 16 лет. Для остальных категорий действует
            общая норма — 40 часов в неделю.
          </p>
        </section>
      </template>

      <p v-else class="no-data">
        Производственный календарь на {{ year }} год ещё не утверждён
        Правительством России, поэтому норма рабочего времени не рассчитана.
        Постановление о переносе выходных дней обычно публикуется осенью
        предыдущего года.
      </p>

      <!-- Перелинковка -->
      <nav class="norm-nav" aria-label="Нормы рабочего времени по годам">
        <div class="norm-nav__siblings">
          <RouterLink
            v-if="prevYear"
            class="norm-nav__sibling"
            :to="`/norma/${prevYear}`"
          >
            ← Норма времени на {{ prevYear }} год
          </RouterLink>
          <span v-else></span>
          <RouterLink
            v-if="nextYear"
            class="norm-nav__sibling"
            :to="`/norma/${nextYear}`"
          >
            Норма времени на {{ nextYear }} год →
          </RouterLink>
        </div>

        <h2 class="norm-nav__title">Смотрите также</h2>
        <ul class="norm-nav__list">
          <li>
            <RouterLink class="norm-nav__link" :to="`/year/${year}`">
              Производственный календарь на {{ year }} год
            </RouterLink>
          </li>
          <li>
            <RouterLink class="norm-nav__link" to="/norma">
              Норма рабочего времени за все годы
            </RouterLink>
          </li>
          <li v-for="tool in TOOLS" :key="tool.slug">
            <RouterLink class="norm-nav__link" :to="toolPath(tool)">
              {{ tool.title }}
            </RouterLink>
          </li>
        </ul>

        <h2 class="norm-nav__title">Норма рабочего времени по годам</h2>
        <ul class="norm-nav__list norm-nav__list--years">
          <li v-for="y in normYears" :key="y">
            <RouterLink
              class="norm-nav__link"
              :class="{ 'is-current': y === year }"
              :to="`/norma/${y}`"
              :title="`Норма рабочего времени на ${y} год`"
            >
              {{ y }}
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>
  </AppLayout>
</template>

<style scoped>
.norm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 32px;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.norm-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.icon-button:hover {
  background-color: var(--color-hover);
  color: var(--color-text);
}

/* Без центрирования: левый край должен совпадать с заголовком страницы */
.norm-content {
  padding: 28px 32px 0;
}

/* Сводка */
.summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 36px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition:
    border-color 0.2s var(--ease),
    transform 0.2s var(--ease);
}

.summary-card:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
}

.summary-value {
  font-size: 1.875rem;
  font-weight: 600;
  letter-spacing: -0.035em;
  color: var(--color-text);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* Тот же цветовой код, что в сводке на главной */
.summary-card:nth-child(2) .summary-value {
  color: var(--color-weekend);
}

.summary-card:nth-child(3) .summary-value {
  color: var(--color-primary);
}

.summary-card:nth-child(4) .summary-value {
  color: var(--color-holiday);
}

.summary-label {
  font-size: 0.78125rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Таблицы */
.table-block {
  margin-bottom: 32px;
}

.table-block h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}

.table-scroll {
  overflow-x: auto;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.norm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.norm-table th,
.norm-table td {
  padding: 8px 12px;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.norm-table thead th {
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  background-color: var(--color-bg-secondary);
}

.norm-table .col-name {
  text-align: left;
  color: var(--color-text);
}

.norm-table tbody tr:last-child td {
  border-bottom: none;
}

.row-total td {
  font-weight: 600;
  background-color: var(--color-hover);
}

.row-year td {
  color: var(--color-primary);
}

.no-data {
  padding: 24px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Текст */
.seo-text {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.7;
  margin-bottom: 32px;
}

.seo-text h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}

.seo-text h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 20px 0 8px;
}

.seo-text p {
  margin: 0 0 8px;
}

/* Перелинковка */
.norm-nav {
  padding-top: 8px;
}

.norm-nav__siblings {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 28px;
}

.norm-nav__sibling {
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

.norm-nav__sibling:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.norm-nav__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}

.norm-nav__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
}

.norm-nav__link {
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

.norm-nav__link:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.norm-nav__link.is-current {
  background-color: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .norm-header {
    padding: 12px 16px;
  }

  .norm-title {
    font-size: 1.0625rem;
  }

  .norm-content {
    padding: 16px 16px 0;
  }

  .summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .norm-nav__siblings {
    flex-direction: column;
  }

  .norm-nav__sibling {
    text-align: center;
  }
}

@media print {
  .norm-nav {
    display: none;
  }
}
</style>

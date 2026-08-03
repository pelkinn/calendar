<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import AppLayout from "@/components/AppLayout.vue";
import AppBreadcrumbs from "@/components/AppBreadcrumbs.vue";
import {
  HOLIDAY_PAGES,
  HOLIDAYS_BASE,
  holidayPath,
  type HolidayPage,
} from "@/data/holidayPages";
import { getCalendarYears } from "@/composables/useProductionCalendar";
import { getCurrentYear } from "@/utils/date";
import { getRestPeriod, plural } from "@/utils/dateCalc";
import { TOOLS, toolPath } from "@/data/tools";

const props = defineProps<{
  page: HolidayPage;
}>();

const currentYear = getCurrentYear();
const years = getCalendarYears();

const weekdayFormatter = new Intl.DateTimeFormat("ru-RU", { weekday: "long" });
const shortFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

/** Как праздник выглядит в каждом году: день недели и период отдыха */
const rows = computed(() =>
  [...years].reverse().map((year) => {
    const date = new Date(year, props.page.month, props.page.day);
    const rest = getRestPeriod(date);
    return {
      year,
      weekday: weekdayFormatter.format(date),
      rest,
      restLabel: rest
        ? `${shortFormatter.format(rest.from)} — ${shortFormatter.format(rest.to)}`
        : "рабочий день",
    };
  }),
);

const currentRow = computed(() => rows.value.find((r) => r.year === currentYear));

const dateLabel = computed(() =>
  shortFormatter.format(new Date(2026, props.page.month, props.page.day)),
);

const canonical = computed(
  () => `https://calendar-online.online${holidayPath(props.page)}`,
);
const description = computed(
  () =>
    `${props.page.name} — ${dateLabel.value}. ${props.page.summary} Расчёт по производственному календарю России.`,
);

const otherPages = computed(() =>
  HOLIDAY_PAGES.filter((p) => p.slug !== props.page.slug),
);

useHead({
  title: computed(
    () => `${props.page.name} ${dateLabel.value} — сколько дней отдыхаем`,
  ),
  meta: [
    { name: "description", content: description },
    {
      name: "keywords",
      content: computed(
        () =>
          `${props.page.name.toLowerCase()}, ${dateLabel.value} выходной, ${props.page.name.toLowerCase()} ${currentYear}, сколько отдыхаем ${dateLabel.value}`,
      ),
    },
    { property: "og:title", content: computed(() => props.page.title) },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: computed(() => props.page.title) },
    { name: "twitter:description", content: description },
  ],
  link: [{ rel: "canonical", href: canonical }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: props.page.name,
          description: props.page.summary,
          url: canonical.value,
          startDate: `${currentYear}-${String(props.page.month + 1).padStart(2, "0")}-${String(props.page.day).padStart(2, "0")}`,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Country",
            name: "Россия",
          },
        }),
      ),
    },
  ],
});

const crumbs = computed(() => [
  { label: "Календарь", to: `/year/${currentYear}` },
  { label: "Праздники", to: HOLIDAYS_BASE },
  { label: props.page.name },
]);
</script>

<template>
  <AppLayout width="narrow">
    <template #page-header>
      <AppBreadcrumbs :items="crumbs" />
    </template>

    <h1>{{ page.title }}</h1>
    <p class="lead">{{ page.summary }}</p>

    <div v-if="currentRow" class="highlight">
      <p class="highlight__main">
        В {{ currentYear }} году —
        {{ dateLabel }}, {{ currentRow.weekday }}
      </p>
      <p v-if="currentRow.rest" class="highlight__sub">
        Отдых длится {{ currentRow.rest.days }}
        {{ plural(currentRow.rest.days, ["день", "дня", "дней"]) }}:
        {{ currentRow.restLabel }}
      </p>
    </div>

    <section class="table-block">
      <h2>{{ page.name }} по годам</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Год</th>
              <th>День недели</th>
              <th>Период отдыха</th>
              <th>Дней подряд</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.year"
              :class="{ 'is-current': row.year === currentYear }"
            >
              <td>
                <RouterLink :to="`/year/${row.year}`" class="year-link">
                  {{ row.year }}
                </RouterLink>
              </td>
              <td>{{ row.weekday }}</td>
              <td>{{ row.restLabel }}</td>
              <td>{{ row.rest ? row.rest.days : "—" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="table-note">
        Период отдыха рассчитан по производственному календарю: учитываются
        соседние выходные и перенесённые Правительством дни.
      </p>
    </section>

    <section class="text-block">
      <h2>О празднике</h2>
      <p v-for="(paragraph, i) in page.text" :key="i">{{ paragraph }}</p>

      <h2>Как оплачивается работа в праздник</h2>
      <p>
        Работа в нерабочий праздничный день оплачивается не менее чем в
        двойном размере (статья 153 ТК РФ). По желанию работника вместо
        повышенной оплаты может быть предоставлен другой день отдыха — тогда
        работа оплачивается в одинарном размере, а день отдыха не
        оплачивается.
      </p>
    </section>

    <nav class="page-nav" aria-label="Другие разделы">
      <h2>Другие праздники</h2>
      <ul class="chips">
        <li v-for="other in otherPages" :key="other.slug">
          <RouterLink :to="holidayPath(other)">{{ other.name }}</RouterLink>
        </li>
      </ul>

      <h2>Календарь и расчёты</h2>
      <ul class="chips">
        <li>
          <RouterLink :to="`/year/${currentYear}`">
            Календарь на {{ currentYear }} год
          </RouterLink>
        </li>
        <li>
          <RouterLink :to="`/norma/${currentYear}`">
            Норма рабочего времени
          </RouterLink>
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
  margin: 0 0 24px;
}

.highlight {
  padding: 20px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-holiday-official);
  border-radius: var(--radius-md);
  margin-bottom: 32px;
}

.highlight__main {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 4px;
}

.highlight__sub {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin: 0;
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
  margin-top: 24px;
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

.data-table tr.is-current td {
  background-color: var(--color-primary-subtle);
  font-weight: 600;
}

.year-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.year-link:hover {
  text-decoration: underline;
}

.table-note {
  margin: 10px 0 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.text-block {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.7;
  margin-bottom: 24px;
}

.text-block p {
  margin: 0 0 10px;
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

@media (max-width: 768px) {
  h1 {
    font-size: 1.375rem;
  }
}
</style>

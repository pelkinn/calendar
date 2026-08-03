<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import AppLayout from "@/components/AppLayout.vue";
import { getCalendarYears } from "@/composables/useProductionCalendar";
import { getYearMonths, sumWorkTime, formatHours } from "@/utils/workTime";
import { getCurrentYear } from "@/utils/date";
import { TOOLS, toolPath } from "@/data/tools";

const normYears = getCalendarYears();
const currentYear = getCurrentYear();

/** Сводка по каждому году для обзорной таблицы */
const rows = computed(() =>
  [...normYears].reverse().map((year) => ({
    year,
    stats: sumWorkTime(getYearMonths(year)),
  })),
);

const description =
  "Норма рабочего времени по годам при 40, 36 и 24-часовой рабочей неделе: количество рабочих дней, выходных и праздничных дней, норма часов за год.";
const canonical = "https://calendar-online.online/norma";

useHead({
  title: "Норма рабочего времени по годам — рабочие дни и часы",
  meta: [
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "норма рабочего времени, норма часов по годам, количество рабочих дней в году, баланс рабочего времени",
    },
    { property: "og:title", content: "Норма рабочего времени по годам" },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: "Норма рабочего времени по годам" },
    { name: "twitter:description", content: description },
  ],
  link: [{ rel: "canonical", href: canonical }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Норма рабочего времени по годам",
        description,
        url: canonical,
        inLanguage: "ru",
      }),
    },
  ],
});
</script>

<template>
  <AppLayout width="narrow">
    <header class="index-header">
      <h1>Норма рабочего времени по годам</h1>
      <p class="lead">
        Количество рабочих дней и норма часов при 40-, 36- и 24-часовой
        рабочей неделе. Расчёт по производственному календарю с учётом
        переносов выходных и сокращённых предпраздничных дней.
      </p>
    </header>

    <div class="table-scroll">
      <table class="norm-table">
        <thead>
          <tr>
            <th class="col-name">Год</th>
            <th>Раб. дни</th>
            <th>Вых. и праздн.</th>
            <th>40 ч</th>
            <th>36 ч</th>
            <th>24 ч</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.year">
            <td class="col-name">
              <RouterLink :to="`/norma/${row.year}`" class="year-link">
                {{ row.year }} год
              </RouterLink>
            </td>
            <td>{{ row.stats.workDays }}</td>
            <td>{{ row.stats.restDays }}</td>
            <td>{{ formatHours(row.stats.hours[40]) }}</td>
            <td>{{ formatHours(row.stats.hours[36]) }}</td>
            <td>{{ formatHours(row.stats.hours[24]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <section class="seo-text">
      <h2>Как пользоваться таблицей</h2>
      <p>
        Выберите год, чтобы посмотреть подробную разбивку нормы рабочего
        времени по месяцам, кварталам и полугодиям. Норма считается по
        методике, утверждённой приказом Минздравсоцразвития России от
        13.08.2009 № 588н, и учитывает сокращение рабочего дня накануне
        праздников по статье 95 ТК РФ.
      </p>
    </section>

    <nav class="index-nav" aria-label="Разделы сайта">
      <h2>Календари</h2>
      <ul>
        <li>
          <RouterLink :to="`/year/${currentYear}`">
            Производственный календарь на {{ currentYear }} год
          </RouterLink>
        </li>
        <li>
          <RouterLink :to="`/norma/${currentYear}`">
            Норма рабочего времени на {{ currentYear }} год
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
.index-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
  margin: 0 0 12px;
}

.lead {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  line-height: 1.7;
  margin: 0 0 28px;
}

.table-scroll {
  overflow-x: auto;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 32px;
}

.norm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.norm-table th,
.norm-table td {
  padding: 10px 14px;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.norm-table thead th {
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background-color: var(--color-bg-secondary);
}

.norm-table .col-name {
  text-align: left;
}

.norm-table tbody tr:last-child td {
  border-bottom: none;
}

.year-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.year-link:hover {
  text-decoration: underline;
}

.seo-text {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.7;
  margin-bottom: 28px;
}

.seo-text h2,
.index-nav h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}

.index-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.index-nav a {
  color: var(--color-primary);
  font-size: 0.875rem;
  text-decoration: none;
}

.index-nav a:hover {
  text-decoration: underline;
}
</style>

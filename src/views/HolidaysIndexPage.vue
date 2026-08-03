<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import AppLayout from "@/components/AppLayout.vue";
import { HOLIDAY_PAGES, holidayPath } from "@/data/holidayPages";
import { getCurrentYear } from "@/utils/date";
import { getRestPeriod, plural } from "@/utils/dateCalc";
import { TOOLS, toolPath } from "@/data/tools";

const currentYear = getCurrentYear();

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

/** Праздники текущего года с периодами отдыха */
const rows = computed(() =>
  HOLIDAY_PAGES.map((page) => {
    const date = new Date(currentYear, page.month, page.day);
    const rest = getRestPeriod(date);
    return {
      page,
      date: dateFormatter.format(date),
      weekday: new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(date),
      rest,
    };
  }),
);

/**
 * Суммарный отдых. Праздники внутри одного периода (Новый год и Рождество)
 * не должны считаться дважды — дедуплицируем по дате начала периода.
 */
const totalRestDays = computed(() => {
  const periods = new Map<number, number>();
  for (const row of rows.value) {
    if (row.rest) periods.set(row.rest.from.getTime(), row.rest.days);
  }
  return [...periods.values()].reduce((acc, days) => acc + days, 0);
});

const description = `Государственные праздники России ${currentYear} года: даты, дни недели, продолжительность выходных и переносы по производственному календарю.`;
const canonical = "https://calendar-online.online/prazdniki";

useHead({
  title: `Праздники России ${currentYear} — даты и выходные дни`,
  meta: [
    { name: "description", content: description },
    {
      name: "keywords",
      content: `праздники ${currentYear}, государственные праздники России, выходные дни ${currentYear}, нерабочие праздничные дни`,
    },
    { property: "og:title", content: `Праздники России ${currentYear}` },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: `Праздники России ${currentYear}` },
    { name: "twitter:description", content: description },
  ],
  link: [{ rel: "canonical", href: canonical }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Государственные праздники России ${currentYear}`,
        url: canonical,
        itemListElement: HOLIDAY_PAGES.map((page, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: page.name,
          url: `https://calendar-online.online${holidayPath(page)}`,
        })),
      }),
    },
  ],
});
</script>

<template>
  <AppLayout width="narrow">
    <h1>Государственные праздники России</h1>
    <p class="lead">
      Нерабочие праздничные дни, установленные статьёй 112 Трудового кодекса.
      Для каждого праздника показано, на какой день недели он приходится в
      {{ currentYear }} году и сколько дней подряд длится отдых с учётом
      переносов выходных.
    </p>

    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Праздник</th>
            <th>Дата</th>
            <th>День недели</th>
            <th>Дней отдыха</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.page.slug">
            <td>
              <RouterLink :to="holidayPath(row.page)" class="name-link">
                {{ row.page.name }}
              </RouterLink>
            </td>
            <td>{{ row.date }}</td>
            <td>{{ row.weekday }}</td>
            <td>{{ row.rest ? row.rest.days : "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="total">
      Всего праздничные периоды {{ currentYear }} года дают
      {{ totalRestDays }}
      {{ plural(totalRestDays, ["день", "дня", "дней"]) }} отдыха — с учётом
      присоединённых выходных и переносов.
    </p>

    <section class="seo-text">
      <h2>Как переносятся выходные</h2>
      <p>
        Если нерабочий праздничный день совпадает с выходным, выходной день
        переносится на следующий после него рабочий день (статья 112 ТК РФ).
        Исключение — праздники с 1 по 8 января: выходные с них переносятся на
        другие дни года отдельным постановлением Правительства, чаще всего к
        майским праздникам.
      </p>
      <h2>Сокращённые предпраздничные дни</h2>
      <p>
        Рабочий день, непосредственно предшествующий нерабочему праздничному,
        сокращается на один час (статья 95 ТК РФ). Это правило действует для
        всех работников, включая тех, кому установлена сокращённая
        продолжительность рабочего времени.
      </p>
    </section>

    <nav class="index-nav" aria-label="Разделы сайта">
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
  margin: 0 0 12px;
}

.lead {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  line-height: 1.7;
  margin: 0 0 24px;
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
  padding: 10px 14px;
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

.name-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.name-link:hover {
  text-decoration: underline;
}

.total {
  margin: 14px 0 28px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.seo-text {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.7;
  margin-bottom: 24px;
}

.seo-text h2,
.index-nav h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 20px 0 10px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0;
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

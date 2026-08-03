<script setup lang="ts">
import { useHead } from "@unhead/vue";
import AppLayout from "@/components/AppLayout.vue";
import { TOOLS, toolPath } from "@/data/tools";
import { getCurrentYear } from "@/utils/date";

const currentYear = getCurrentYear();

const description =
  "Бесплатные онлайн-калькуляторы дат: количество дней между датами, дата через N рабочих дней, возраст, номер недели. Расчёты по производственному календарю России.";
const canonical = "https://calendar-online.online/kalkulyator";

useHead({
  title: "Калькуляторы дат онлайн — расчёты по производственному календарю",
  meta: [
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "калькулятор дат, калькулятор дней, расчёт рабочих дней, онлайн калькулятор даты",
    },
    { property: "og:title", content: "Калькуляторы дат онлайн" },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: "Калькуляторы дат онлайн" },
    { name: "twitter:description", content: description },
  ],
  link: [{ rel: "canonical", href: canonical }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Калькуляторы дат",
        url: canonical,
        itemListElement: TOOLS.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.title,
          url: `https://calendar-online.online${toolPath(tool)}`,
        })),
      }),
    },
  ],
});
</script>

<template>
  <AppLayout width="narrow">
    <h1>Калькуляторы дат</h1>
    <p class="lead">
      Расчёты с датами по производственному календарю России: калькуляторы
      учитывают государственные праздники, перенесённые выходные и
      сокращённые предпраздничные дни.
    </p>

    <ul class="tool-list">
      <li v-for="tool in TOOLS" :key="tool.slug">
        <RouterLink :to="toolPath(tool)" class="tool-card">
          <span class="tool-card__title">{{ tool.title }}</span>
          <span class="tool-card__summary">{{ tool.summary }}</span>
        </RouterLink>
      </li>
    </ul>

    <section class="seo-text">
      <h2>Календарные и рабочие дни</h2>
      <p>
        Большинство ошибок в расчётах возникает из-за того, что срок в
        рабочих днях считают как календарный. Разница за длинные новогодние
        или майские праздники доходит до недели. Все калькуляторы на этой
        странице берут рабочие дни из официального производственного
        календаря, поэтому переносы выходных учитываются автоматически.
      </p>
    </section>

    <nav class="index-nav" aria-label="Разделы сайта">
      <h2>Календарь и нормы времени</h2>
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
        <li>
          <RouterLink to="/norma">
            Норма рабочего времени по годам
          </RouterLink>
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
  margin: 0 0 28px;
}

.tool-list {
  list-style: none;
  margin: 0 0 32px;
  padding: 0;
  display: grid;
  gap: 12px;
}

.tool-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.15s ease;
}

.tool-card:hover {
  border-color: var(--color-primary);
}

.tool-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-primary);
}

.tool-card__summary {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  line-height: 1.5;
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

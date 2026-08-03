<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import AppLayout from "@/components/AppLayout.vue";
import { ARTICLES, articlePath } from "@/data/articles";
import { getCurrentYear } from "@/utils/date";
import { HOLIDAYS_BASE } from "@/data/holidayPages";
import { TOOLS, toolPath } from "@/data/tools";

const currentYear = getCurrentYear();

const formatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Свежие материалы сверху
const sorted = computed(() =>
  [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date)),
);

const description =
  "Статьи о рабочем времени, праздниках и расчёте сроков: перенос выходных, норма рабочего времени, календарные и рабочие дни в договорах.";
const canonical = "https://calendar-online.online/stati";

useHead({
  title: "Статьи о рабочем времени и календаре",
  meta: [
    { name: "description", content: description },
    {
      name: "keywords",
      content:
        "статьи о рабочем времени, перенос выходных, норма часов, сроки в договорах",
    },
    { property: "og:title", content: "Статьи о рабочем времени и календаре" },
    { property: "og:description", content: description },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: "Статьи о рабочем времени и календаре" },
    { name: "twitter:description", content: description },
  ],
  link: [{ rel: "canonical", href: canonical }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Статьи о рабочем времени и календаре",
        url: canonical,
        inLanguage: "ru",
        blogPost: ARTICLES.map((article) => ({
          "@type": "BlogPosting",
          headline: article.title,
          description: article.summary,
          url: `https://calendar-online.online${articlePath(article)}`,
          datePublished: article.date,
        })),
      }),
    },
  ],
});
</script>

<template>
  <AppLayout width="narrow">
    <h1>Статьи</h1>
    <p class="lead">
      Разборы правил, по которым устроены рабочее время, праздники и сроки:
      как переносятся выходные, как считается норма часов и чем календарные
      дни отличаются от рабочих.
    </p>

    <ul class="article-list">
      <li v-for="article in sorted" :key="article.slug">
        <RouterLink :to="articlePath(article)" class="card">
          <span class="card__title">{{ article.title }}</span>
          <span class="card__summary">{{ article.summary }}</span>
          <time class="card__date" :datetime="article.date">
            {{ formatter.format(new Date(article.date)) }}
          </time>
        </RouterLink>
      </li>
    </ul>

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
  margin: 0 0 12px;
}

.lead {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  line-height: 1.7;
  margin: 0 0 28px;
}

.article-list {
  list-style: none;
  margin: 0 0 32px;
  padding: 0;
  display: grid;
  gap: 12px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 18px 20px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: all 0.15s ease;
}

.card:hover {
  border-color: var(--color-primary);
}

.card__title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1.35;
}

.card__summary {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.card__date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  opacity: 0.8;
}

.index-nav h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
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

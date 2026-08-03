<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import AppLayout from "@/components/AppLayout.vue";
import AppBreadcrumbs from "@/components/AppBreadcrumbs.vue";
import {
  ARTICLES,
  ARTICLES_BASE,
  articlePath,
  type Article,
} from "@/data/articles";
import { getCurrentYear } from "@/utils/date";
import { HOLIDAYS_BASE } from "@/data/holidayPages";
import { TOOLS, toolPath } from "@/data/tools";

const props = defineProps<{
  article: Article;
}>();

const currentYear = getCurrentYear();

const canonical = computed(
  () => `https://calendar-online.online${articlePath(props.article)}`,
);

const dateLabel = computed(() =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(props.article.date)),
);

const others = computed(() =>
  ARTICLES.filter((a) => a.slug !== props.article.slug),
);

useHead({
  title: computed(() => props.article.title),
  meta: [
    { name: "description", content: computed(() => props.article.summary) },
    { name: "keywords", content: computed(() => props.article.keywords) },
    { property: "og:type", content: "article" },
    { property: "og:title", content: computed(() => props.article.title) },
    { property: "og:description", content: computed(() => props.article.summary) },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: computed(() => props.article.title) },
    {
      name: "twitter:description",
      content: computed(() => props.article.summary),
    },
  ],
  link: [{ rel: "canonical", href: canonical }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: props.article.title,
          description: props.article.summary,
          url: canonical.value,
          datePublished: props.article.date,
          dateModified: props.article.updated ?? props.article.date,
          inLanguage: "ru",
          author: {
            "@type": "Organization",
            name: "Производственный календарь онлайн",
            url: "https://calendar-online.online",
          },
          publisher: {
            "@type": "Organization",
            name: "Производственный календарь онлайн",
            url: "https://calendar-online.online",
          },
          mainEntityOfPage: canonical.value,
        }),
      ),
    },
  ],
});

const crumbs = computed(() => [
  { label: "Календарь", to: `/year/${currentYear}` },
  { label: "Статьи", to: ARTICLES_BASE },
  { label: props.article.title },
]);
</script>

<template>
  <AppLayout width="text">
    <template #page-header>
      <AppBreadcrumbs :items="crumbs" />
    </template>

    <article>
      <h1>{{ article.title }}</h1>
      <p class="summary">{{ article.summary }}</p>
      <p class="meta">
        <time :datetime="article.date">{{ dateLabel }}</time>
      </p>

      <div class="content">
        <template v-for="(block, i) in article.blocks" :key="i">
          <h2 v-if="block.type === 'h2'">{{ block.text }}</h2>
          <p v-else-if="block.type === 'p'">{{ block.text }}</p>
          <blockquote v-else-if="block.type === 'quote'">
            {{ block.text }}
          </blockquote>
          <ul v-else-if="block.type === 'ul'">
            <li v-for="(item, j) in block.items" :key="j">{{ item }}</li>
          </ul>
        </template>
      </div>
    </article>

    <nav class="page-nav" aria-label="Другие материалы">
      <h2>Другие статьи</h2>
      <ul class="article-list">
        <li v-for="other in others" :key="other.slug">
          <RouterLink :to="articlePath(other)">{{ other.title }}</RouterLink>
          <span class="article-list__summary">{{ other.summary }}</span>
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
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: var(--color-text);
  margin: 0 0 12px;
}

.summary {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--color-text-muted);
  margin: 0 0 10px;
}

.meta {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: 0 0 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.content {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--color-text);
}

.content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 32px 0 12px;
}

.content p {
  margin: 0 0 16px;
}

.content ul {
  margin: 0 0 16px;
  padding-left: 22px;
}

.content li {
  margin-bottom: 6px;
}

.content blockquote {
  margin: 0 0 16px;
  padding: 14px 18px;
  background-color: var(--color-bg);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-weight: 600;
  color: var(--color-text);
}

.page-nav h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 40px 0 14px;
}

.article-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.article-list li {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.article-list a {
  color: var(--color-primary);
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
}

.article-list a:hover {
  text-decoration: underline;
}

.article-list__summary {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  line-height: 1.5;
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
    font-size: 1.5rem;
  }

  .content {
    font-size: 0.9375rem;
  }
}
</style>

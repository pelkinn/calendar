<script setup lang="ts">
import { computed } from "vue";
import { useHead } from "@unhead/vue";
import { TOOLS, TOOLS_BASE, toolPath } from "@/data/tools";
import { HOLIDAYS_BASE } from "@/data/holidayPages";
import { ARTICLES_BASE } from "@/data/articles";
import { getCurrentYear } from "@/utils/date";
import AppLayout from "@/components/AppLayout.vue";
import AppBreadcrumbs from "@/components/AppBreadcrumbs.vue";

const props = defineProps<{
  /** Slug текущего инструмента */
  slug: string;
  title: string;
  description: string;
  /** Ключевые слова для meta keywords */
  keywords: string;
}>();

const currentYear = getCurrentYear();

const canonical = computed(
  () => `https://calendar-online.online${TOOLS_BASE}/${props.slug}`,
);

// Остальные калькуляторы — для перелинковки
const otherTools = computed(() => TOOLS.filter((t) => t.slug !== props.slug));

const crumbs = computed(() => [
  { label: "Календарь", to: `/year/${currentYear}` },
  { label: "Калькуляторы дат", to: TOOLS_BASE },
  { label: props.title },
]);

useHead({
  title: computed(() => `${props.title} — онлайн-калькулятор`),
  meta: [
    { name: "description", content: computed(() => props.description) },
    { name: "keywords", content: computed(() => props.keywords) },
    { property: "og:title", content: computed(() => props.title) },
    { property: "og:description", content: computed(() => props.description) },
    { property: "og:url", content: canonical },
    { name: "twitter:title", content: computed(() => props.title) },
    { name: "twitter:description", content: computed(() => props.description) },
  ],
  link: [{ rel: "canonical", href: canonical }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: props.title,
          description: props.description,
          url: canonical.value,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          inLanguage: "ru",
          offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
        }),
      ),
    },
  ],
});
</script>

<template>
  <AppLayout>
    <template #page-header>
      <AppBreadcrumbs :items="crumbs" />
    </template>

    <h1 class="tool-title">{{ title }}</h1>
    <p class="tool-lead">{{ description }}</p>

    <!-- Форма и результат -->
    <slot />

    <!-- Пояснительный текст -->
    <section class="tool-text">
      <slot name="text" />
    </section>

    <nav class="tool-nav" aria-label="Другие калькуляторы">
      <h2>Другие калькуляторы дат</h2>
      <ul>
        <li v-for="tool in otherTools" :key="tool.slug">
          <RouterLink :to="toolPath(tool)">{{ tool.title }}</RouterLink>
          <span class="tool-nav__summary">{{ tool.summary }}</span>
        </li>
      </ul>

      <h2>Календарь и нормы</h2>
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
          <RouterLink :to="HOLIDAYS_BASE">
            Государственные праздники России
          </RouterLink>
        </li>
        <li>
          <RouterLink :to="ARTICLES_BASE">
            Статьи о рабочем времени и сроках
          </RouterLink>
        </li>
      </ul>
    </nav>
  </AppLayout>
</template>

<style scoped>
.tool-title {
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0 0 10px;
}

.tool-lead {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  line-height: 1.7;
  margin: 0 0 28px;
}

.tool-text {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.7;
  margin: 32px 0;
}

.tool-text :deep(h2) {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 24px 0 10px;
}

.tool-text :deep(h3) {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 20px 0 8px;
}

.tool-text :deep(p) {
  margin: 0 0 10px;
}

.tool-text :deep(ul) {
  margin: 0 0 10px;
  padding-left: 20px;
}

.tool-nav h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 24px 0 12px;
}

.tool-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-nav li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tool-nav a {
  color: var(--color-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
}

.tool-nav a:hover {
  text-decoration: underline;
}

.tool-nav__summary {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .tool-title {
    font-size: 1.375rem;
  }
}
</style>

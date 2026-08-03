<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getCurrentYear } from "@/utils/date";
import { isSeoYear } from "@/types/calendar";
import { TOOLS, toolPath } from "@/data/tools";
import { HOLIDAY_PAGES, HOLIDAYS_BASE, holidayPath } from "@/data/holidayPages";
import { ARTICLES, ARTICLES_BASE, articlePath } from "@/data/articles";

const currentYear = getCurrentYear();
const nextYear = currentYear + 1;
const hasNextYear = isSeoYear(nextYear);
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <nav class="site-footer__cols" aria-label="Разделы сайта">
        <div class="site-footer__col">
          <h2>Календарь</h2>
          <ul>
            <li>
              <RouterLink :to="`/year/${currentYear}`">
                Производственный календарь {{ currentYear }}
              </RouterLink>
            </li>
            <li v-if="hasNextYear">
              <RouterLink :to="`/year/${nextYear}`">
                Производственный календарь {{ nextYear }}
              </RouterLink>
            </li>
            <li>
              <RouterLink :to="`/norma/${currentYear}`">
                Норма рабочего времени {{ currentYear }}
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/norma">Норма времени по годам</RouterLink>
            </li>
          </ul>
        </div>

        <div class="site-footer__col">
          <h2>Праздники</h2>
          <ul>
            <li>
              <RouterLink :to="HOLIDAYS_BASE">Все праздники России</RouterLink>
            </li>
            <li v-for="holiday in HOLIDAY_PAGES" :key="holiday.slug">
              <RouterLink :to="holidayPath(holiday)">
                {{ holiday.name }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <div class="site-footer__col">
          <h2>Калькуляторы</h2>
          <ul>
            <li v-for="tool in TOOLS" :key="tool.slug">
              <RouterLink :to="toolPath(tool)">{{ tool.title }}</RouterLink>
            </li>
          </ul>
        </div>

        <div class="site-footer__col">
          <h2>Статьи</h2>
          <ul>
            <li>
              <RouterLink :to="ARTICLES_BASE">Все статьи</RouterLink>
            </li>
            <li v-for="article in ARTICLES" :key="article.slug">
              <RouterLink :to="articlePath(article)">
                {{ article.title }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <div class="site-footer__bottom">
        <span>Производственный календарь России {{ currentYear }}</span>
        <span>
          Разработка —
          <a
            href="https://t.me/pelkin"
            target="_blank"
            rel="noopener noreferrer"
          >
            Александр Перепелкин
          </a>
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 56px;
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border);
}

.site-footer__inner {
  padding: 36px 32px 24px;
}

.site-footer__cols {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px 24px;
}

.site-footer__col h2 {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--color-text-faint);
  margin: 0 0 12px;
}

.site-footer__col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.site-footer__col a {
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  line-height: 1.4;
  text-decoration: none;
  transition: color 0.16s var(--ease);
}

.site-footer__col a:hover {
  color: var(--color-text);
}

.site-footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 24px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.site-footer__bottom a {
  color: var(--color-text-muted);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.site-footer__bottom a:hover {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

@media (max-width: 900px) {
  .site-footer__cols {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .site-footer__inner {
    padding: 28px 16px 20px;
  }
}

@media print {
  .site-footer {
    display: none;
  }
}
</style>

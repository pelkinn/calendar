<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { getNavItems, isNavItemActive } from "@/data/nav";
import { getCurrentYear } from "@/utils/date";
import ThemeIcon from "@/components/icons/ThemeIcon.vue";
import { useTheme } from "@/composables/useTheme";

const route = useRoute();
const { theme, toggleTheme } = useTheme();

const isDark = computed(() => theme.value === "dark");
const themeTitle = computed(() =>
  isDark.value ? "Переключить на светлую тему" : "Переключить на тёмную тему",
);

const navItems = getNavItems();
const homeLink = `/year/${getCurrentYear()}`;

const isActive = (match: string) =>
  isNavItemActive({ label: "", to: "", match }, route.path);
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink class="brand" :to="homeLink">
        <svg
          class="brand__mark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="16" rx="4" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
        <span class="brand__text">
          Календарь<span class="brand__accent">.online</span>
        </span>
      </RouterLink>

      <nav class="site-nav" aria-label="Основная навигация">
        <RouterLink
          v-for="item in navItems"
          :key="item.match"
          class="site-nav__link"
          :class="{ 'is-active': isActive(item.match) }"
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="site-header__actions">
        <slot name="actions" />
        <button
          class="site-header__theme"
          @click="toggleTheme"
          :title="themeTitle"
          aria-label="Переключить тему"
        >
          <ThemeIcon :is-dark="isDark" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 60;
  /* Полупрозрачная подложка с размытием: контент под шапкой не обрывается резко */
  background-color: color-mix(in srgb, var(--color-bg) 82%, transparent);
  backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid var(--color-border);
}

@supports not (backdrop-filter: blur(1px)) {
  .site-header {
    background-color: var(--color-bg);
  }
}

.site-header__inner {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 0 32px;
  min-height: var(--header-height);
}

/* Бренд */
.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  color: var(--color-text);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.brand__mark {
  width: 19px;
  height: 19px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.brand__accent {
  color: var(--color-text-muted);
  font-weight: 450;
}

/* Меню */
.site-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.site-nav__link {
  padding: 6px 11px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.84375rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color 0.16s var(--ease),
    background-color 0.16s var(--ease);
}

.site-nav__link:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

.site-nav__link.is-active {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

[data-theme="dark"] .site-nav__link:hover,
[data-theme="dark"] .site-nav__link.is-active {
  background-color: var(--color-border);
}

.site-header__actions {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
  margin-left: auto;
}

.site-header__theme {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--color-text-muted);
  transition:
    color 0.16s var(--ease),
    border-color 0.16s var(--ease),
    transform 0.16s var(--ease);
}

.site-header__theme:hover {
  color: var(--color-text);
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}

@media (max-width: 1024px) {
  .site-header__inner {
    padding: 0 20px;
    gap: 12px;
  }
}

/* Мобильные: меню уезжает в горизонтальный скролл под брендом */
@media (max-width: 768px) {
  .site-header__inner {
    flex-wrap: wrap;
    padding: 8px 16px 0;
    gap: 8px;
  }

  .site-nav {
    order: 3;
    width: 100%;
    flex: none;
    margin: 0 -16px;
    padding: 0 16px 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .site-nav::-webkit-scrollbar {
    display: none;
  }

  .site-nav__link {
    padding: 6px 10px;
    font-size: 0.8125rem;
  }

  .site-header__theme {
    width: 30px;
    height: 30px;
  }
}

@media print {
  .site-header {
    display: none;
  }
}
</style>

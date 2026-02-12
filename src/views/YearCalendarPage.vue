<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import { buildYearCalendar, isValidYear, getCurrentYear } from "@/utils/date";
import { MIN_YEAR, MAX_YEAR } from "@/types/calendar";
import SidebarYearPicker from "@/components/SidebarYearPicker.vue";
import MonthGrid from "@/components/MonthGrid.vue";
import ThemeIcon from "@/components/icons/ThemeIcon.vue";
import PrintIcon from "@/components/icons/PrintIcon.vue";
import HolidayIcon from "@/components/icons/HolidayIcon.vue";
import { useTheme } from "@/composables/useTheme";
import { useHolidays } from "@/composables/useHolidays";

const props = defineProps<{
  year: number;
}>();

const router = useRouter();
const { theme, toggleTheme } = useTheme();
const { showHolidays, toggleHolidays } = useHolidays();

// Динамические мета-теги для SEO
useHead({
  title: computed(
    () =>
      `Производственный календарь на ${props.year} год — Праздники и выходные`,
  ),
  meta: [
    {
      name: "description",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год. Праздники, переносы выходных, сокращённые дни. Все месяцы на одной странице с печатью.`,
      ),
    },
    {
      name: "keywords",
      content: computed(
        () =>
          `производственный календарь ${props.year}, календарь ${props.year}, праздники ${props.year}, выходные дни ${props.year}, перенос выходных ${props.year}`,
      ),
    },
    // Open Graph
    {
      property: "og:title",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год — Праздники и выходные`,
      ),
    },
    {
      property: "og:description",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год. Праздники, переносы выходных, сокращённые дни.`,
      ),
    },
    {
      property: "og:url",
      content: computed(
        () => `https://calendar.example.com/year/${props.year}`,
      ),
    },
    // Twitter Card
    {
      name: "twitter:title",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год — Праздники и выходные`,
      ),
    },
    {
      name: "twitter:description",
      content: computed(
        () =>
          `Производственный календарь на ${props.year} год. Праздники, переносы выходных, сокращённые дни.`,
      ),
    },
  ],
  link: [
    {
      rel: "canonical",
      href: computed(() => `https://calendar.example.com/year/${props.year}`),
    },
  ],
});

// Проверяем валидность года, если невалиден — редирект
watch(
  () => props.year,
  (newYear) => {
    if (!isValidYear(newYear, MIN_YEAR, MAX_YEAR) || isNaN(newYear)) {
      router.replace(`/year/${getCurrentYear()}`);
    }
  },
  { immediate: true },
);

// Данные календаря
const calendarMonths = computed(() => {
  if (!isValidYear(props.year, MIN_YEAR, MAX_YEAR)) {
    return [];
  }
  return buildYearCalendar(props.year);
});

// Заголовок
const pageTitle = computed(() => `Календарь на ${props.year} год`);

// Печать
const handlePrint = () => {
  window.print();
};

// Тема
const isDark = computed(() => theme.value === "dark");
const themeTitle = computed(() =>
  theme.value === "light"
    ? "Переключить на тёмную тему"
    : "Переключить на светлую тему",
);

const holidaysTitle = computed(() =>
  showHolidays.value ? "Скрыть праздники" : "Показать праздники",
);
</script>

<template>
  <div class="calendar-page">
    <SidebarYearPicker :current-year="year" />

    <main class="calendar-layout">
      <header class="calendar-header">
        <h1 class="calendar-title">{{ pageTitle }}</h1>
        <div class="header-actions">
          <button
            class="holiday-toggle"
            :class="{ active: showHolidays }"
            @click="toggleHolidays"
            :title="holidaysTitle"
            aria-label="Переключить отображение праздников"
          >
            <HolidayIcon :active="showHolidays" />
          </button>
          <button
            class="theme-toggle"
            @click="toggleTheme"
            :title="themeTitle"
            aria-label="Переключить тему"
          >
            <ThemeIcon :is-dark="isDark" />
          </button>
          <button
            class="print-button"
            @click="handlePrint"
            title="Печать календаря"
          >
            <PrintIcon />
            <span>Печать</span>
          </button>
        </div>
      </header>

      <MonthGrid :months="calendarMonths" />

      <footer class="site-footer">
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
      </footer>
    </main>
  </div>
</template>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}

.calendar-layout {
  margin-left: var(--sidebar-width);
  min-height: 100vh;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.calendar-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.holiday-toggle,
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.holiday-toggle:hover,
.theme-toggle:hover {
  background-color: var(--color-hover);
  color: var(--color-text);
  border-color: var(--color-border);
}

.holiday-toggle.active {
  color: var(--color-holiday-official);
  border-color: var(--color-holiday-official);
  background-color: var(--color-holiday-active-bg);
}

.print-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.print-button:hover {
  background-color: var(--color-hover);
  border-color: var(--color-border);
}

/* Футер */
.site-footer {
  padding: 24px 32px;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.site-footer a {
  color: var(--color-text-muted);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.site-footer a:hover {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Адаптив: планшет */
@media (max-width: 1024px) {
  .calendar-layout {
    margin-left: 180px;
  }

  .calendar-header {
    padding: 16px 24px;
  }

  .calendar-title {
    font-size: 1.25rem;
  }
}

/* Адаптив: мобильные */
@media (max-width: 768px) {
  .calendar-layout {
    margin-left: 0;
  }

  .calendar-header {
    padding: 14px 16px;
    padding-left: 60px; /* Место для кнопки меню */
  }

  .calendar-title {
    font-size: 1.125rem;
  }

  .print-button {
    padding: 8px 14px;
    font-size: 0.8125rem;
  }

  .print-button span {
    display: none;
  }

  .theme-toggle,
  .holiday-toggle {
    width: 36px;
    height: 36px;
  }
}

/* Адаптив: узкие мобильные */
@media (max-width: 480px) {
  .calendar-header {
    gap: 8px;
  }

  .calendar-title {
    font-size: 1rem;
  }
}
</style>

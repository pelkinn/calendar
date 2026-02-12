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
const pageTitleShort = computed(() => `${props.year} год`);

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
        <h1 class="calendar-title">
          <span class="title-full">{{ pageTitle }}</span>
          <span class="title-short">{{ pageTitleShort }}</span>
        </h1>

        <div class="calendar-legend">
          <div class="legend-item">
            <span class="legend-sample legend-sample--holiday">
              <span class="legend-number">8</span>
              <span class="legend-dot legend-dot--holiday"></span>
            </span>
            <span class="legend-label">Выходной / праздник</span>
          </div>
          <div class="legend-item">
            <span class="legend-sample legend-sample--shortened">
              <span class="legend-number legend-number--shortened">31</span>
              <span class="legend-dot legend-dot--shortened"></span>
            </span>
            <span class="legend-label">Сокращённый день</span>
          </div>
          <div class="legend-item">
            <span class="legend-sample legend-sample--today">
              <span class="legend-number">12</span>
            </span>
            <span class="legend-label">Сегодня</span>
          </div>
          <div class="legend-item">
            <span class="legend-sample legend-sample--selected">
              <span class="legend-number">5</span>
            </span>
            <span class="legend-label">Выбранная дата</span>
          </div>
        </div>

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
  gap: 16px;
  padding: 16px 32px;
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
  white-space: nowrap;
  flex-shrink: 0;
}

.title-short {
  display: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
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

/* Легенда */
.calendar-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-sample {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
}

.legend-number {
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1;
}

.legend-sample--holiday .legend-number {
  color: var(--color-holiday-official);
}

.legend-dot--holiday {
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--color-holiday-official);
}

.legend-number--shortened {
  color: var(--color-weekday);
}

.legend-dot--shortened {
  position: absolute;
  bottom: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 2px;
  border-radius: 1px;
  background-color: var(--color-holiday);
}

.legend-sample--today .legend-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--color-today-bg);
  border: 2px solid var(--color-today-border);
  border-radius: 50%;
  font-weight: 600;
  color: var(--color-text);
}

.legend-sample--selected .legend-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--color-selected-bg);
  color: var(--color-selected-text);
  border-radius: 50%;
  font-weight: 600;
}

.legend-label {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
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
@media (max-width: 1400px) {
  .calendar-layout {
    margin-left: 180px;
  }

  .calendar-header {
    flex-wrap: wrap;
    padding: 12px 24px;
    gap: 8px 12px;
  }

  .calendar-title {
    font-size: 1.25rem;
  }

  .header-actions {
    margin-left: auto;
  }

  .calendar-legend {
    width: 100%;
    order: 3;
    gap: 12px;
    padding-top: 6px;
    border-top: 1px solid var(--color-border);
  }
}

/* Адаптив: мобильные */
@media (max-width: 768px) {
  .calendar-layout {
    margin-left: 0;
  }

  .calendar-header {
    padding: 12px 16px;
    padding-left: 60px; /* Место для кнопки меню */
  }

  .calendar-title {
    font-size: 1.125rem;
  }

  .title-full {
    display: none;
  }

  .title-short {
    display: inline;
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

  .calendar-legend {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
  }

  .legend-item {
    gap: 4px;
  }

  .legend-label {
    font-size: 0.6875rem;
  }

  .legend-sample {
    width: 20px;
    height: 20px;
  }

  .legend-number {
    font-size: 0.6875rem;
  }

  .legend-sample--today .legend-number,
  .legend-sample--selected .legend-number {
    width: 20px;
    height: 20px;
    font-size: 0.6875rem;
  }
}

/* Адаптив: узкие мобильные */
@media (max-width: 480px) {
  .calendar-title {
    font-size: 1rem;
  }
}
</style>

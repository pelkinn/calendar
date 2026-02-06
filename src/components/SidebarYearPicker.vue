<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { generateYearRange, isValidYear, getCurrentYear } from "@/utils/date";
import {
  MIN_YEAR,
  MAX_YEAR,
  SIDEBAR_YEAR_START,
  SIDEBAR_YEAR_END,
} from "@/types/calendar";

defineProps<{
  currentYear: number;
}>();

const router = useRouter();

// Годы для бокового меню
const sidebarYears = computed(() =>
  generateYearRange(SIDEBAR_YEAR_START, SIDEBAR_YEAR_END),
);

// Ввод года
const yearInput = ref("");
const inputError = ref("");

// Состояние мобильного меню
const isMenuOpen = ref(false);

// Ref для списка годов
const yearsListRef = ref<HTMLElement | null>(null);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const navigateToYear = (year: number) => {
  router.push(`/year/${year}`);
  closeMenu();
};

const handleYearSubmit = () => {
  inputError.value = "";
  const year = parseInt(yearInput.value, 10);

  if (isNaN(year)) {
    inputError.value = "Введите число";
    return;
  }

  if (!isValidYear(year, MIN_YEAR, MAX_YEAR)) {
    inputError.value = `Год должен быть от ${MIN_YEAR} до ${MAX_YEAR}`;
    return;
  }

  navigateToYear(year);
  yearInput.value = "";
};

const isCurrentSystemYear = (year: number) => year === getCurrentYear();

// Автоскролл к текущему году при загрузке
onMounted(() => {
  nextTick(() => {
    const activeButton = yearsListRef.value?.querySelector(
      ".year-button.active",
    );
    if (activeButton) {
      activeButton.scrollIntoView({ block: "center" });
    }
  });
});
</script>

<template>
  <!-- Мобильная кнопка меню -->
  <button
    class="mobile-menu-toggle"
    :class="{ open: isMenuOpen }"
    @click="toggleMenu"
    aria-label="Открыть меню выбора года"
  >
    <span class="hamburger"></span>
  </button>

  <!-- Оверлей для мобильного меню -->
  <div v-if="isMenuOpen" class="sidebar-overlay" @click="closeMenu"></div>

  <!-- Сайдбар -->
  <aside class="sidebar" :class="{ open: isMenuOpen }">
    <div class="sidebar-content">
      <h2 class="sidebar-title">Выбор года</h2>

      <!-- Список годов -->
      <nav ref="yearsListRef" class="years-list" aria-label="Список годов">
        <button
          v-for="year in sidebarYears"
          :key="year"
          class="year-button"
          :class="{
            active: year === currentYear,
            'current-system': isCurrentSystemYear(year),
          }"
          @click="navigateToYear(year)"
        >
          <span v-if="isCurrentSystemYear(year)" class="current-marker"></span>
          {{ year }}
        </button>
      </nav>

      <!-- Блок ввода года -->
      <div class="year-input-block">
        <label class="input-label">Посмотреть календарь за год:</label>
        <div class="input-row">
          <input
            v-model="yearInput"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="year-input"
            :placeholder="`${MIN_YEAR}–${MAX_YEAR}`"
            @keyup.enter="handleYearSubmit"
          />
          <button class="submit-button" @click="handleYearSubmit">Ok</button>
        </div>
        <p v-if="inputError" class="input-error">{{ inputError }}</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--color-bg);
  box-shadow: 1px 0 0 var(--color-border);
  overflow: hidden;
  z-index: 100;
  transition: transform 0.3s ease;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 16px 20px;
  box-sizing: border-box;
}

.sidebar-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
  padding-left: 12px;
  color: var(--color-text-muted);
}

.years-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.years-list::-webkit-scrollbar {
  width: 4px;
}

.years-list::-webkit-scrollbar-track {
  background: transparent;
}

.years-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.year-button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 400;
  text-align: left;
  transition: all 0.15s ease;
  position: relative;
}

.year-button:hover {
  background-color: var(--color-hover);
}

.year-button.active {
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  font-weight: 600;
}

.year-button.current-system:not(.active) {
  font-weight: 500;
}

.current-marker {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--color-primary);
  flex-shrink: 0;
}

.year-button.active .current-marker {
  background-color: var(--color-primary);
}

.year-input-block {
  flex-shrink: 0;
  padding-top: 20px;
  margin-top: auto;
  border-top: 1px solid var(--color-border);
}

.input-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: 10px;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.year-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  outline: none;
  background-color: var(--color-bg);
  color: var(--color-text);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.year-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.year-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.submit-button {
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.15s ease;
}

.submit-button:hover {
  background-color: var(--color-primary-hover);
}

.input-error {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--color-error);
}

/* Мобильная кнопка меню */
.mobile-menu-toggle {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  box-shadow: 0 1px 3px var(--color-shadow);
  z-index: 200;
  align-items: center;
  justify-content: center;
}

.hamburger {
  display: block;
  width: 18px;
  height: 2px;
  background-color: var(--color-text);
  position: relative;
  transition: background-color 0.2s ease;
}

.hamburger::before,
.hamburger::after {
  content: "";
  position: absolute;
  left: 0;
  width: 18px;
  height: 2px;
  background-color: var(--color-text);
  transition: transform 0.2s ease;
}

.hamburger::before {
  top: -6px;
}

.hamburger::after {
  top: 6px;
}

.mobile-menu-toggle.open .hamburger {
  background-color: transparent;
}

.mobile-menu-toggle.open .hamburger::before {
  transform: translateY(6px) rotate(45deg);
}

.mobile-menu-toggle.open .hamburger::after {
  transform: translateY(-6px) rotate(-45deg);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  z-index: 90;
  backdrop-filter: blur(2px);
}

/* Адаптив: планшет */
@media (max-width: 1024px) {
  .sidebar {
    width: 180px;
  }
}

/* Адаптив: мобильные */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .sidebar {
    width: 260px;
    transform: translateX(-100%);
    box-shadow: 4px 0 20px var(--color-shadow-lg);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }
}
</style>

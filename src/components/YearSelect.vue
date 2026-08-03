<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { generateYearRange, isValidYear, getCurrentYear } from "@/utils/date";
import {
  MIN_YEAR,
  MAX_YEAR,
  SIDEBAR_YEAR_START,
  SIDEBAR_YEAR_END,
  isSeoYear,
} from "@/types/calendar";

const props = withDefaults(
  defineProps<{
    currentYear: number;
    /** Базовый путь ссылок: /year/2026 или /norma/2026 */
    linkPrefix?: string;
    /** Явный список годов; по умолчанию — весь диапазон */
    years?: number[];
  }>(),
  {
    linkPrefix: "/year",
    years: undefined,
  },
);

const router = useRouter();

const isOpen = ref(false);
const yearInput = ref("");
const inputError = ref("");
const rootRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement | null>(null);

const allYears = computed(
  () => props.years ?? generateYearRange(SIDEBAR_YEAR_START, SIDEBAR_YEAR_END),
);

/**
 * Ссылку ставим только на существующую в статике страницу.
 * Для явного списка (нормы) пре-рендерятся все, иначе — только SEO-годы.
 */
const hasStaticPage = (year: number) => (props.years ? true : isSeoYear(year));

const yearLink = (year: number) => `${props.linkPrefix}/${year}`;

const inputPlaceholder = computed(() => {
  const list = props.years;
  return list
    ? `${list[0]}–${list[list.length - 1]}`
    : `${MIN_YEAR}–${MAX_YEAR}`;
});

const isCurrentSystemYear = (year: number) => year === getCurrentYear();

const close = () => {
  isOpen.value = false;
  inputError.value = "";
};

const toggle = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    // Открылись — подкручиваем список к выбранному году
    nextTick(() => {
      listRef.value
        ?.querySelector(".year-option.is-active")
        ?.scrollIntoView({ block: "center" });
    });
  }
};

const goToYear = (year: number) => {
  router.push(yearLink(year));
  close();
};

const handleSubmit = () => {
  inputError.value = "";
  const year = parseInt(yearInput.value, 10);

  if (isNaN(year)) {
    inputError.value = "Введите число";
    return;
  }

  const min = props.years ? props.years[0] : MIN_YEAR;
  const max = props.years ? props.years[props.years.length - 1] : MAX_YEAR;

  if (!isValidYear(year, min, max)) {
    inputError.value = `Год от ${min} до ${max}`;
    return;
  }

  goToYear(year);
  yearInput.value = "";
};

// Закрытие по клику вне и по Escape
const onPointerDown = (e: MouseEvent) => {
  if (!isOpen.value) return;
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) close();
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isOpen.value) close();
};

onMounted(() => {
  document.addEventListener("mousedown", onPointerDown);
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", onPointerDown);
  document.removeEventListener("keydown", onKeydown);
});

// Ушли на другой год — панель больше не нужна
watch(() => props.currentYear, close);
</script>

<template>
  <div ref="rootRef" class="year-select">
    <button
      class="year-select__button"
      type="button"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      @click="toggle"
    >
      <span class="year-select__value">{{ currentYear }}</span>
      <svg
        class="year-select__chevron"
        :class="{ 'is-open': isOpen }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <Transition name="year-pop">
      <div v-if="isOpen" class="year-select__panel" role="dialog" aria-label="Выбор года">
        <div ref="listRef" class="year-select__list">
          <component
            :is="hasStaticPage(year) ? RouterLink : 'button'"
            v-for="year in allYears"
            :key="year"
            :to="hasStaticPage(year) ? yearLink(year) : undefined"
            type="button"
            class="year-option"
            :class="{
              'is-active': year === currentYear,
              'is-now': isCurrentSystemYear(year),
            }"
            @click="hasStaticPage(year) ? close() : goToYear(year)"
          >
            {{ year }}
          </component>
        </div>

        <div class="year-select__foot">
          <label class="year-select__label" for="year-jump">Другой год</label>
          <div class="year-select__row">
            <input
              id="year-jump"
              v-model="yearInput"
              class="year-select__input"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :placeholder="inputPlaceholder"
              @keyup.enter="handleSubmit"
            />
            <button class="year-select__go" type="button" @click="handleSubmit">
              →
            </button>
          </div>
          <p v-if="inputError" class="year-select__error">{{ inputError }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.year-select {
  position: relative;
}

.year-select__button {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 9px 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--color-text);
  font-size: 0.84375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transition:
    border-color 0.16s var(--ease),
    transform 0.16s var(--ease);
}

.year-select__button:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}

.year-select__button[aria-expanded="true"] {
  border-color: var(--color-primary);
}

.year-select__chevron {
  width: 14px;
  height: 14px;
  color: var(--color-text-muted);
  transition: transform 0.18s var(--ease);
}

.year-select__chevron.is-open {
  transform: rotate(180deg);
}

/* Панель */
.year-select__panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 80;
  width: 268px;
  padding: 10px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.year-select__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2px;
  max-height: 244px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-strong) transparent;
}

.year-select__list::-webkit-scrollbar {
  width: 3px;
}

.year-select__list::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: 3px;
}

.year-option {
  display: block;
  width: 100%;
  padding: 7px 0;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  text-align: center;
  text-decoration: none;
  transition:
    color 0.15s var(--ease),
    background-color 0.15s var(--ease);
}

.year-option:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}

[data-theme="dark"] .year-option:hover {
  background-color: var(--color-border);
}

.year-option.is-now:not(.is-active) {
  color: var(--color-text);
}

.year-option.is-active {
  background-color: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.year-select__foot {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.year-select__label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--color-text-faint);
  margin-bottom: 7px;
}

.year-select__row {
  display: flex;
  gap: 6px;
}

.year-select__input {
  flex: 1;
  min-width: 0;
  height: 31px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  outline: none;
  transition:
    border-color 0.16s var(--ease),
    box-shadow 0.16s var(--ease);
}

.year-select__input::placeholder {
  color: var(--color-text-faint);
}

.year-select__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

.year-select__go {
  width: 34px;
  height: 31px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: var(--color-text-muted);
  transition:
    border-color 0.16s var(--ease),
    color 0.16s var(--ease);
}

.year-select__go:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text);
}

.year-select__error {
  margin: 7px 0 0;
  font-size: 0.71875rem;
  color: var(--color-error);
}

/* Появление панели */
.year-pop-enter-active,
.year-pop-leave-active {
  transition:
    opacity 0.16s var(--ease),
    transform 0.16s var(--ease);
}

.year-pop-enter-from,
.year-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 480px) {
  .year-select__panel {
    width: min(268px, calc(100vw - 32px));
  }
}

@media print {
  .year-select {
    display: none;
  }
}
</style>

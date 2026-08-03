<script setup lang="ts">
import { computed, ref } from "vue";
import ToolLayout from "@/components/ToolLayout.vue";
import { getCurrentYear } from "@/utils/date";
import {
  addDays,
  formatLongDate,
  getDayOfYear,
  getISOWeek,
  getISOWeekYear,
  isWorkingDay,
  parseISODate,
  toISODate,
} from "@/utils/dateCalc";

const year = getCurrentYear();
const value = ref(`${year}-01-01`);

const date = computed(() => parseISODate(value.value));

const error = computed(() => (date.value ? "" : "Укажите корректную дату"));

const week = computed(() => (date.value ? getISOWeek(date.value) : 0));
const weekYear = computed(() => (date.value ? getISOWeekYear(date.value) : 0));
const dayOfYear = computed(() => (date.value ? getDayOfYear(date.value) : 0));
const quarter = computed(() =>
  date.value ? Math.floor(date.value.getMonth() / 3) + 1 : 0,
);
const weekday = computed(() =>
  date.value
    ? new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(date.value)
    : "",
);

/** Границы недели: понедельник — воскресенье */
const weekRange = computed(() => {
  if (!date.value) return null;
  const offset = (date.value.getDay() + 6) % 7;
  const monday = addDays(date.value, -offset);
  return { monday, sunday: addDays(monday, 6) };
});

const isWork = computed(() => (date.value ? isWorkingDay(date.value) : false));

const setToday = () => {
  value.value = toISODate(new Date());
};
</script>

<template>
  <ToolLayout
    slug="nomer-nedeli"
    title="Номер недели по дате"
    description="Калькулятор определяет номер недели по стандарту ISO 8601, день недели, порядковый номер дня в году и квартал для любой даты, а также показывает границы недели."
    keywords="номер недели, какая сейчас неделя, номер недели по дате, ISO 8601 неделя, какой день недели, номер дня в году"
  >
    <div class="calc-form">
      <div class="calc-field calc-field--wide">
        <label class="calc-label" for="date">Дата</label>
        <input id="date" v-model="value" type="date" class="calc-input" />
      </div>

      <p v-if="error" class="calc-error">{{ error }}</p>

      <div class="calc-actions">
        <button class="calc-button" @click="setToday">Сегодня</button>
      </div>
    </div>

    <div v-if="date && weekRange" class="calc-result">
      <p class="calc-result__main">{{ week }} неделя {{ weekYear }} года</p>
      <p class="calc-result__sub">
        {{ formatLongDate(date) }} — {{ isWork ? "рабочий день" : "нерабочий день" }}
      </p>

      <div class="calc-grid">
        <div class="calc-stat">
          <span class="calc-stat__value">{{ weekday }}</span>
          <span class="calc-stat__label">день недели</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ dayOfYear }}</span>
          <span class="calc-stat__label">день года</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ quarter }}</span>
          <span class="calc-stat__label">квартал</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">
            {{ date.getDate() }}.{{
              String(date.getMonth() + 1).padStart(2, "0")
            }}
          </span>
          <span class="calc-stat__label">число и месяц</span>
        </div>
      </div>

      <p class="calc-note">
        Неделя длится с
        {{ weekRange.monday.toLocaleDateString("ru-RU") }} (понедельник) по
        {{ weekRange.sunday.toLocaleDateString("ru-RU") }} (воскресенье).
      </p>
    </div>

    <template #text>
      <h2>Как считается номер недели</h2>
      <p>
        Расчёт идёт по международному стандарту ISO 8601, который принят и в
        России (ГОСТ ИСО 8601-2001). Неделя начинается с понедельника, а первой
        неделей года считается та, в которую попадает первый четверг января —
        то есть неделя, содержащая не менее четырёх дней нового года.
      </p>
      <p>
        Из-за этого правила первые дни января могут относиться к последней
        неделе предыдущего года, а последние дни декабря — к первой неделе
        следующего. Поэтому калькулятор показывает не только номер недели, но и
        год, к которому она относится.
      </p>
      <h3>Где используются номера недель</h3>
      <ul>
        <li>производственное и логистическое планирование;</li>
        <li>отчётность и графики поставок;</li>
        <li>учебные расписания — чётные и нечётные недели;</li>
        <li>международный документооборот, где дата записывается как 2026-W15.</li>
      </ul>
      <h3>Сколько недель в году</h3>
      <p>
        В году бывает 52 или 53 недели по ISO. Год содержит 53 недели, если он
        начинается с четверга либо это високосный год, начинающийся со среды.
        В остальных случаях недель 52.
      </p>
    </template>
  </ToolLayout>
</template>

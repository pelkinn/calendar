<script setup lang="ts">
import { computed, ref } from "vue";
import ToolLayout from "@/components/ToolLayout.vue";
import { getCurrentYear } from "@/utils/date";
import {
  analyzePeriod,
  formatLongDate,
  parseISODate,
  plural,
  toISODate,
} from "@/utils/dateCalc";

const year = getCurrentYear();

// Значения по умолчанию детерминированы (не «сегодня»), чтобы
// пре-рендер и клиент дали одинаковый HTML
const from = ref(`${year}-01-01`);
const to = ref(`${year}-12-31`);
const includeEnd = ref(true);

const fromDate = computed(() => parseISODate(from.value));
const toDate = computed(() => parseISODate(to.value));

const error = computed(() => {
  if (!fromDate.value || !toDate.value) return "Укажите обе даты";
  return "";
});

const stats = computed(() =>
  fromDate.value && toDate.value
    ? analyzePeriod(fromDate.value, toDate.value, includeEnd.value)
    : null,
);

/** Итог с учётом того, считаем ли последний день */
const totalDays = computed(() => {
  if (!stats.value) return 0;
  return includeEnd.value ? stats.value.totalDays + 1 : stats.value.totalDays;
});

const weeks = computed(() => Math.floor(totalDays.value / 7));

const setToday = (target: "from" | "to") => {
  const today = toISODate(new Date());
  if (target === "from") from.value = today;
  else to.value = today;
};
</script>

<template>
  <ToolLayout
    slug="dney-mezhdu-datami"
    title="Сколько дней между датами"
    description="Калькулятор считает количество календарных, рабочих и выходных дней между двумя датами с учётом производственного календаря России: праздников, переносов выходных и сокращённых дней."
    keywords="сколько дней между датами, калькулятор дней, количество рабочих дней между датами, разница между датами"
  >
    <div class="calc-form">
      <div class="calc-field">
        <label class="calc-label" for="from">Начальная дата</label>
        <input id="from" v-model="from" type="date" class="calc-input" />
      </div>
      <div class="calc-field">
        <label class="calc-label" for="to">Конечная дата</label>
        <input id="to" v-model="to" type="date" class="calc-input" />
      </div>

      <div class="calc-field calc-field--wide">
        <label class="calc-label">
          <input v-model="includeEnd" type="checkbox" />
          Включать конечную дату в подсчёт
        </label>
      </div>

      <p v-if="error" class="calc-error">{{ error }}</p>

      <div class="calc-actions">
        <button class="calc-button" @click="setToday('from')">
          Начало — сегодня
        </button>
        <button class="calc-button" @click="setToday('to')">
          Конец — сегодня
        </button>
      </div>
    </div>

    <div v-if="stats && fromDate && toDate" class="calc-result">
      <p class="calc-result__main">
        {{ totalDays }} {{ plural(totalDays, ["день", "дня", "дней"]) }}
      </p>
      <p class="calc-result__sub">
        с {{ formatLongDate(fromDate) }} по {{ formatLongDate(toDate) }}
      </p>

      <div class="calc-grid">
        <div class="calc-stat">
          <span class="calc-stat__value">{{ stats.workDays }}</span>
          <span class="calc-stat__label">рабочих дней</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ stats.restDays }}</span>
          <span class="calc-stat__label">выходных и праздничных</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ weeks }}</span>
          <span class="calc-stat__label">полных недель</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ stats.workHours }}</span>
          <span class="calc-stat__label">рабочих часов (40-час. неделя)</span>
        </div>
      </div>

      <p v-if="!stats.exact" class="calc-note">
        На часть периода производственный календарь ещё не утверждён — рабочие
        и выходные дни посчитаны по пятидневной неделе, без учёта праздников и
        переносов.
      </p>
    </div>

    <template #text>
      <h2>Как считается количество дней между датами</h2>
      <p>
        Калькулятор определяет разницу между двумя датами в календарных днях, а
        затем разбирает период по производственному календарю России: каждый
        день проверяется на то, рабочий он или нерабочий. Учитываются
        государственные праздники, перенесённые выходные и обычные субботы с
        воскресеньями.
      </p>
      <p>
        Галочка «включать конечную дату» меняет результат на один день. Она
        нужна, потому что в разных задачах период считают по-разному: срок
        хранения документа обычно включает последний день, а количество дней
        между событиями — нет.
      </p>
      <h3>Где это нужно</h3>
      <ul>
        <li>расчёт отпускных и компенсаций — считаются календарные дни;</li>
        <li>сроки по договору и претензионные сроки — чаще рабочие дни;</li>
        <li>планирование проекта — важно количество рабочих дней;</li>
        <li>больничный лист — календарные дни нетрудоспособности.</li>
      </ul>
      <h3>Рабочие и календарные дни — в чём разница</h3>
      <p>
        Календарные дни — все дни подряд, включая выходные и праздники. Рабочие
        дни — только те, когда организация работает по производственному
        календарю. Если в договоре не указано, какие именно дни имеются в виду,
        по общему правилу срок считается в календарных днях (статья 190 ГК РФ).
      </p>
    </template>
  </ToolLayout>
</template>

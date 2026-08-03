<script setup lang="ts">
import { computed, ref } from "vue";
import ToolLayout from "@/components/ToolLayout.vue";
import { getCurrentYear } from "@/utils/date";
import { analyzePeriod, formatLongDate, parseISODate, plural, toISODate } from "@/utils/dateCalc";
import { formatHours } from "@/utils/workTime";

const year = getCurrentYear();

const from = ref(`${year}-01-01`);
const to = ref(`${year}-03-31`);

const fromDate = computed(() => parseISODate(from.value));
const toDate = computed(() => parseISODate(to.value));

const error = computed(() =>
  fromDate.value && toDate.value ? "" : "Укажите обе даты",
);

const stats = computed(() =>
  fromDate.value && toDate.value
    ? analyzePeriod(fromDate.value, toDate.value, true)
    : null,
);

/** Норма часов при сокращённой неделе считается по той же методике */
const hours = computed(() => {
  if (!stats.value) return null;
  const { workDays, shortenedDays } = stats.value;
  const calc = (week: number) =>
    Math.round(((week / 5) * workDays - shortenedDays) * 10) / 10;
  return { 40: calc(40), 36: calc(36), 24: calc(24) };
});

const setToday = (target: "from" | "to") => {
  const today = toISODate(new Date());
  if (target === "from") from.value = today;
  else to.value = today;
};
</script>

<template>
  <ToolLayout
    slug="rabochie-dni"
    title="Калькулятор рабочих дней"
    description="Калькулятор считает количество рабочих дней за период по производственному календарю России и норму рабочего времени в часах при 40, 36 и 24-часовой неделе."
    keywords="калькулятор рабочих дней, количество рабочих дней, рабочие дни за период, норма часов за период, рабочие дни между датами"
  >
    <div class="calc-form">
      <div class="calc-field">
        <label class="calc-label" for="from">Начало периода</label>
        <input id="from" v-model="from" type="date" class="calc-input" />
      </div>
      <div class="calc-field">
        <label class="calc-label" for="to">Конец периода</label>
        <input id="to" v-model="to" type="date" class="calc-input" />
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

    <div v-if="stats && hours && fromDate && toDate" class="calc-result">
      <p class="calc-result__main">
        {{ stats.workDays }}
        {{ plural(stats.workDays, ["рабочий день", "рабочих дня", "рабочих дней"]) }}
      </p>
      <p class="calc-result__sub">
        с {{ formatLongDate(fromDate) }} по {{ formatLongDate(toDate) }}
        включительно
      </p>

      <div class="calc-grid">
        <div class="calc-stat">
          <span class="calc-stat__value">{{ formatHours(hours[40]) }}</span>
          <span class="calc-stat__label">часов при 40-часовой неделе</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ formatHours(hours[36]) }}</span>
          <span class="calc-stat__label">часов при 36-часовой неделе</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ formatHours(hours[24]) }}</span>
          <span class="calc-stat__label">часов при 24-часовой неделе</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ stats.restDays }}</span>
          <span class="calc-stat__label">выходных и праздничных</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ stats.shortenedDays }}</span>
          <span class="calc-stat__label">сокращённых на час дней</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ stats.totalDays + 1 }}</span>
          <span class="calc-stat__label">календарных дней</span>
        </div>
      </div>

      <p v-if="!stats.exact" class="calc-note">
        Производственный календарь захватывает не весь период — часть дней
        посчитана по пятидневной неделе, без учёта праздников и переносов.
      </p>
    </div>

    <template #text>
      <h2>Как считаются рабочие дни</h2>
      <p>
        Рабочими считаются все дни периода, кроме выходных, нерабочих
        праздничных дней и выходных, перенесённых постановлением Правительства.
        Норма часов рассчитывается по методике приказа Минздравсоцразвития
        России от 13.08.2009 № 588н: продолжительность недели делится на пять и
        умножается на число рабочих дней, затем вычитается по часу за каждый
        сокращённый предпраздничный день.
      </p>
      <h3>Для чего используют расчёт</h3>
      <ul>
        <li>табель учёта рабочего времени и расчёт зарплаты за период;</li>
        <li>планирование сроков проекта и загрузки сотрудников;</li>
        <li>расчёт компенсации при суммированном учёте рабочего времени;</li>
        <li>определение сроков по договорам, где счёт идёт в рабочих днях.</li>
      </ul>
      <h3>Кому положена сокращённая неделя</h3>
      <p>
        36 часов в неделю работают занятые во вредных условиях труда 3 и 4
        степени, педагоги, инвалиды I и II групп; 24 часа — работники младше
        16 лет. Для всех остальных норма — 40 часов.
      </p>
    </template>
  </ToolLayout>
</template>

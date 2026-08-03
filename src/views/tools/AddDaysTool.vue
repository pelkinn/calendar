<script setup lang="ts">
import { computed, ref } from "vue";
import ToolLayout from "@/components/ToolLayout.vue";
import { getCurrentYear } from "@/utils/date";
import {
  addDays,
  addWorkDays,
  formatLongDate,
  hasCalendarFor,
  parseISODate,
  plural,
  toISODate,
} from "@/utils/dateCalc";

const year = getCurrentYear();

const start = ref(`${year}-01-01`);
const amount = ref(30);
const mode = ref<"calendar" | "work">("calendar");
const direction = ref<"add" | "subtract">("add");

const startDate = computed(() => parseISODate(start.value));

const error = computed(() => {
  if (!startDate.value) return "Укажите корректную дату";
  if (!Number.isFinite(amount.value)) return "Укажите количество дней";
  if (Math.abs(amount.value) > 10_000) return "Слишком большой период";
  return "";
});

const result = computed(() => {
  if (!startDate.value || error.value) return null;
  const delta = direction.value === "add" ? amount.value : -amount.value;
  return mode.value === "calendar"
    ? addDays(startDate.value, delta)
    : addWorkDays(startDate.value, delta);
});

/** Для рабочих дней важно, есть ли календарь на весь захваченный период */
const exact = computed(() => {
  if (!startDate.value || !result.value) return true;
  if (mode.value === "calendar") return true;
  const [from, to] =
    startDate.value <= result.value
      ? [startDate.value, result.value]
      : [result.value, startDate.value];
  return hasCalendarFor(from, to);
});

const setToday = () => {
  start.value = toISODate(new Date());
};
</script>

<template>
  <ToolLayout
    slug="data-cherez-dney"
    title="Дата через N дней"
    description="Калькулятор прибавляет или вычитает календарные и рабочие дни от выбранной даты. Рабочие дни считаются по производственному календарю России — с учётом праздников и переносов выходных."
    keywords="дата через сколько дней, прибавить дни к дате, вычесть дни из даты, дата через 30 дней, рабочие дни калькулятор"
  >
    <div class="calc-form">
      <div class="calc-field">
        <label class="calc-label" for="start">Дата отсчёта</label>
        <input id="start" v-model="start" type="date" class="calc-input" />
      </div>

      <div class="calc-field">
        <label class="calc-label" for="amount">Количество дней</label>
        <input
          id="amount"
          v-model.number="amount"
          type="number"
          min="0"
          max="10000"
          class="calc-input"
        />
      </div>

      <div class="calc-field">
        <label class="calc-label" for="direction">Направление</label>
        <select id="direction" v-model="direction" class="calc-select">
          <option value="add">Прибавить</option>
          <option value="subtract">Вычесть</option>
        </select>
      </div>

      <div class="calc-field">
        <label class="calc-label" for="mode">Тип дней</label>
        <select id="mode" v-model="mode" class="calc-select">
          <option value="calendar">Календарные</option>
          <option value="work">Рабочие</option>
        </select>
      </div>

      <p v-if="error" class="calc-error">{{ error }}</p>

      <div class="calc-actions">
        <button class="calc-button" @click="setToday">Отсчёт от сегодня</button>
      </div>
    </div>

    <div v-if="result && startDate" class="calc-result">
      <p class="calc-result__main">{{ formatLongDate(result) }}</p>
      <p class="calc-result__sub">
        {{ direction === "add" ? "Через" : "За" }} {{ amount }}
        {{
          mode === "work"
            ? plural(amount, ["рабочий день", "рабочих дня", "рабочих дней"])
            : plural(amount, [
                "календарный день",
                "календарных дня",
                "календарных дней",
              ])
        }}
        {{ direction === "add" ? "после" : "до" }}
        {{ formatLongDate(startDate) }}
      </p>

      <div class="calc-grid">
        <div class="calc-stat">
          <span class="calc-stat__value">{{ toISODate(result) }}</span>
          <span class="calc-stat__label">в формате ГГГГ-ММ-ДД</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">
            {{ result.toLocaleDateString("ru-RU") }}
          </span>
          <span class="calc-stat__label">в формате ДД.ММ.ГГГГ</span>
        </div>
      </div>

      <p v-if="!exact" class="calc-note">
        Производственный календарь захватывает не весь период — рабочие дни
        отсчитаны по пятидневной неделе, без учёта праздников и переносов.
      </p>
    </div>

    <template #text>
      <h2>Как работает калькулятор</h2>
      <p>
        В режиме календарных дней к дате просто прибавляется указанное
        количество суток. В режиме рабочих дней отсчёт идёт только по рабочим
        дням: выходные, государственные праздники и перенесённые выходные
        пропускаются и в счёт не идут. Данные берутся из производственного
        календаря России.
      </p>
      <h3>Когда срок считают в рабочих днях</h3>
      <p>
        Многие процессуальные и договорные сроки установлены именно в рабочих
        днях: срок ответа на претензию, сроки по 44-ФЗ и 223-ФЗ, срок
        рассмотрения обращений. Если срок в рабочих днях, а последний день
        выпадает на выходной, окончание переносится на ближайший рабочий день
        (статья 193 ГК РФ).
      </p>
      <h3>Частые расчёты</h3>
      <ul>
        <li>дата через 30, 45, 60 или 90 календарных дней;</li>
        <li>срок в 10 или 30 рабочих дней по договору;</li>
        <li>дата за N дней до события — режим «вычесть»;</li>
        <li>окончание испытательного срока при приёме на работу.</li>
      </ul>
    </template>
  </ToolLayout>
</template>

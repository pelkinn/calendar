<script setup lang="ts">
import { computed, ref } from "vue";
import ToolLayout from "@/components/ToolLayout.vue";
import { getCurrentYear } from "@/utils/date";
import {
  daysBetween,
  formatLongDate,
  getISOWeek,
  parseISODate,
  plural,
  toISODate,
} from "@/utils/dateCalc";

const currentYear = getCurrentYear();

/** Недель в году по ISO: 53, если 31 декабря попадает в 53-ю неделю */
function weeksInYear(year: number): number {
  const dec31 = new Date(year, 11, 31);
  const week = getISOWeek(dec31);
  // Если 31 декабря уже относится к первой неделе следующего года —
  // смотрим на 24 декабря, оно всегда в последней неделе текущего
  return week === 1 ? getISOWeek(new Date(year, 11, 24)) : week;
}

const year = ref(currentYear);

const yearWeeks = computed(() => weeksInYear(year.value));

/** Ближайшие годы — для таблицы */
const table = computed(() =>
  Array.from({ length: 11 }, (_, i) => {
    const y = currentYear - 3 + i;
    return { year: y, weeks: weeksInYear(y) };
  }),
);

// Недели между датами
const from = ref(`${currentYear}-01-01`);
const to = ref(`${currentYear}-12-31`);

const fromDate = computed(() => parseISODate(from.value));
const toDate = computed(() => parseISODate(to.value));

const between = computed(() => {
  if (!fromDate.value || !toDate.value) return null;
  const days = Math.abs(daysBetween(fromDate.value, toDate.value));
  return { days, weeks: Math.floor(days / 7), rest: days % 7 };
});

const setToday = () => {
  from.value = toISODate(new Date());
};
</script>

<template>
  <ToolLayout
    slug="skolko-nedel-v-godu"
    title="Сколько недель в году"
    description="В году 52 или 53 недели по стандарту ISO 8601. Калькулятор показывает точное количество недель в любом году и считает, сколько недель прошло между двумя датами."
    keywords="сколько недель в году, 52 или 53 недели, количество недель в году, сколько недель между датами, недели ISO 8601"
  >
    <div class="calc-form">
      <div class="calc-field calc-field--wide">
        <label class="calc-label" for="year">Год</label>
        <input
          id="year"
          v-model.number="year"
          type="number"
          min="1900"
          max="2100"
          class="calc-input"
        />
      </div>
    </div>

    <div class="calc-result">
      <p class="calc-result__main">
        {{ yearWeeks }} {{ plural(yearWeeks, ["неделя", "недели", "недель"]) }}
      </p>
      <p class="calc-result__sub">
        в {{ year }} году по стандарту ISO 8601 — это
        {{ yearWeeks === 53 ? "длинный" : "обычный" }} год
      </p>
    </div>

    <section class="block">
      <h2>Недели между двумя датами</h2>
      <div class="calc-form">
        <div class="calc-field">
          <label class="calc-label" for="from">Начальная дата</label>
          <input id="from" v-model="from" type="date" class="calc-input" />
        </div>
        <div class="calc-field">
          <label class="calc-label" for="to">Конечная дата</label>
          <input id="to" v-model="to" type="date" class="calc-input" />
        </div>
        <div class="calc-actions">
          <button class="calc-button" @click="setToday">
            Начало — сегодня
          </button>
        </div>
      </div>

      <div v-if="between && fromDate && toDate" class="calc-result">
        <p class="calc-result__main">
          {{ between.weeks }}
          {{ plural(between.weeks, ["неделя", "недели", "недель"]) }}
          <template v-if="between.rest">
            и {{ between.rest }}
            {{ plural(between.rest, ["день", "дня", "дней"]) }}
          </template>
        </p>
        <p class="calc-result__sub">
          между {{ formatLongDate(fromDate) }} и {{ formatLongDate(toDate) }} —
          всего {{ between.days }}
          {{ plural(between.days, ["день", "дня", "дней"]) }}
        </p>
      </div>
    </section>

    <section class="block">
      <h2>Количество недель по годам</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Год</th>
              <th>Недель</th>
              <th>Тип года</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in table"
              :key="row.year"
              :class="{ 'is-current': row.year === year }"
            >
              <td>{{ row.year }}</td>
              <td>{{ row.weeks }}</td>
              <td>{{ row.weeks === 53 ? "длинный" : "обычный" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <template #text>
      <h2>Почему в году бывает 53 недели</h2>
      <p>
        Год состоит из 365 дней — это 52 недели и один день, а в високосном
        году остаётся два лишних дня. Эти «хвосты» накапливаются, и примерно
        раз в пять-шесть лет год по стандарту ISO 8601 содержит 53 недели.
      </p>
      <p>
        Правило простое: год длинный, если он начинается с четверга, либо это
        високосный год, начинающийся со среды. В остальных случаях в году
        52 недели.
      </p>
      <h3>Как считаются недели по ISO 8601</h3>
      <p>
        Неделя начинается с понедельника. Первой неделей года считается та, в
        которую попадает первый четверг января — то есть неделя, содержащая не
        менее четырёх дней нового года. Из-за этого 1 января иногда относится к
        последней неделе предыдущего года.
      </p>
      <h3>Где это важно</h3>
      <ul>
        <li>планирование производства и поставок по неделям;</li>
        <li>расчёт зарплаты при недельном учёте;</li>
        <li>учебные графики и расписания;</li>
        <li>отчётность в международном формате вида 2026-W15.</li>
      </ul>
    </template>
  </ToolLayout>
</template>

<style scoped>
.block {
  margin-top: 32px;
}

.block h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}

.table-scroll {
  overflow-x: auto;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th,
.data-table td {
  padding: 9px 14px;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.data-table thead th {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background-color: var(--color-bg-secondary);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tr.is-current td {
  background-color: var(--color-primary-subtle);
  font-weight: 600;
}
</style>

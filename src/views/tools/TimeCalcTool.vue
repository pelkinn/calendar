<script setup lang="ts">
import { computed, ref } from "vue";
import ToolLayout from "@/components/ToolLayout.vue";

/** Время в секундах из полей часы/минуты/секунды */
function toSeconds(h: number, m: number, s: number): number {
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
}

function formatDuration(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "−" : "";
  const abs = Math.abs(totalSeconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  return `${sign}${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const firstH = ref(8);
const firstM = ref(30);
const firstS = ref(0);

const secondH = ref(1);
const secondM = ref(45);
const secondS = ref(0);

const operation = ref<"add" | "subtract">("add");

const first = computed(() => toSeconds(firstH.value, firstM.value, firstS.value));
const second = computed(() =>
  toSeconds(secondH.value, secondM.value, secondS.value),
);

const result = computed(() =>
  operation.value === "add" ? first.value + second.value : first.value - second.value,
);

const asHours = computed(() => Math.round((result.value / 3600) * 100) / 100);
const asMinutes = computed(() => Math.round(result.value / 60));
const asDays = computed(() => Math.round((result.value / 86400) * 100) / 100);
</script>

<template>
  <ToolLayout
    slug="kalkulyator-vremeni"
    title="Калькулятор времени"
    description="Калькулятор складывает и вычитает время в формате часы : минуты : секунды и переводит результат в часы, минуты и дни. Подходит для подсчёта отработанных часов и длительности интервалов."
    keywords="калькулятор времени, сложение времени, вычитание времени, сложить часы и минуты, перевести минуты в часы"
  >
    <div class="calc-form">
      <div class="calc-field calc-field--wide">
        <span class="calc-label">Первое значение</span>
        <div class="time-row">
          <input v-model.number="firstH" type="number" min="0" class="calc-input" />
          <span class="colon">:</span>
          <input
            v-model.number="firstM"
            type="number"
            min="0"
            max="59"
            class="calc-input"
          />
          <span class="colon">:</span>
          <input
            v-model.number="firstS"
            type="number"
            min="0"
            max="59"
            class="calc-input"
          />
        </div>
        <span class="calc-hint">часы : минуты : секунды</span>
      </div>

      <div class="calc-field calc-field--wide">
        <label class="calc-label" for="op">Действие</label>
        <select id="op" v-model="operation" class="calc-select">
          <option value="add">Сложить</option>
          <option value="subtract">Вычесть</option>
        </select>
      </div>

      <div class="calc-field calc-field--wide">
        <span class="calc-label">Второе значение</span>
        <div class="time-row">
          <input v-model.number="secondH" type="number" min="0" class="calc-input" />
          <span class="colon">:</span>
          <input
            v-model.number="secondM"
            type="number"
            min="0"
            max="59"
            class="calc-input"
          />
          <span class="colon">:</span>
          <input
            v-model.number="secondS"
            type="number"
            min="0"
            max="59"
            class="calc-input"
          />
        </div>
      </div>
    </div>

    <div class="calc-result">
      <p class="calc-result__main">{{ formatDuration(result) }}</p>
      <p class="calc-result__sub">часы : минуты : секунды</p>

      <div class="calc-grid">
        <div class="calc-stat">
          <span class="calc-stat__value">{{ asHours }}</span>
          <span class="calc-stat__label">в часах</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ asMinutes }}</span>
          <span class="calc-stat__label">в минутах</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ result }}</span>
          <span class="calc-stat__label">в секундах</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ asDays }}</span>
          <span class="calc-stat__label">в сутках</span>
        </div>
      </div>
    </div>

    <template #text>
      <h2>Как складывать и вычитать время</h2>
      <p>
        Время неудобно считать в уме, потому что в часе 60 минут, а не 100:
        привычная десятичная арифметика здесь не работает. Калькулятор переводит
        оба значения в секунды, выполняет действие и возвращает результат
        обратно в формат часов, минут и секунд.
      </p>
      <p>
        Если вычитаемое больше уменьшаемого, результат будет отрицательным — он
        показывается со знаком минус. Это удобно, когда нужно понять, сколько
        часов не хватает до нормы.
      </p>
      <h3>Типичные задачи</h3>
      <ul>
        <li>суммирование отработанных часов за смену или неделю;</li>
        <li>подсчёт переработки относительно нормы рабочего времени;</li>
        <li>сложение длительностей записей, треков или тренировок;</li>
        <li>перевод минут в часы и обратно.</li>
      </ul>
      <h3>Перевод единиц времени</h3>
      <p>
        В одном часе 60 минут и 3600 секунд, в сутках — 24 часа, 1440 минут и
        86 400 секунд. Результат сразу показан во всех этих единицах, чтобы не
        пересчитывать вручную.
      </p>
    </template>
  </ToolLayout>
</template>

<style scoped>
.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.colon {
  color: var(--color-text-muted);
  font-weight: 600;
}
</style>

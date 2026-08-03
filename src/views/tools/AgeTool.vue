<script setup lang="ts">
import { computed, ref } from "vue";
import ToolLayout from "@/components/ToolLayout.vue";
import { getCurrentYear } from "@/utils/date";
import {
  daysBetween,
  formatLongDate,
  getAge,
  parseISODate,
  plural,
  toISODate,
} from "@/utils/dateCalc";

const year = getCurrentYear();

const birth = ref("1990-01-01");
const at = ref(`${year}-01-01`);

const birthDate = computed(() => parseISODate(birth.value));
const atDate = computed(() => parseISODate(at.value));

const error = computed(() => {
  if (!birthDate.value) return "Укажите дату рождения";
  if (!atDate.value) return "Укажите дату расчёта";
  if (birthDate.value > atDate.value)
    return "Дата рождения позже даты расчёта";
  return "";
});

const age = computed(() =>
  birthDate.value && atDate.value && !error.value
    ? getAge(birthDate.value, atDate.value)
    : null,
);

const totalDays = computed(() =>
  birthDate.value && atDate.value && !error.value
    ? daysBetween(birthDate.value, atDate.value)
    : 0,
);

/** Ближайший день рождения после расчётной даты */
const nextBirthday = computed(() => {
  if (!birthDate.value || !atDate.value || error.value) return null;

  const candidate = new Date(
    atDate.value.getFullYear(),
    birthDate.value.getMonth(),
    birthDate.value.getDate(),
  );
  if (candidate < atDate.value) candidate.setFullYear(candidate.getFullYear() + 1);
  return candidate;
});

const daysToBirthday = computed(() =>
  nextBirthday.value && atDate.value
    ? daysBetween(atDate.value, nextBirthday.value)
    : 0,
);

const setToday = () => {
  at.value = toISODate(new Date());
};
</script>

<template>
  <ToolLayout
    slug="vozrast"
    title="Калькулятор возраста"
    description="Калькулятор считает полный возраст в годах, месяцах и днях на любую дату, общее количество прожитых дней и недель, а также дату и обратный отсчёт до ближайшего дня рождения."
    keywords="калькулятор возраста, сколько мне лет, возраст по дате рождения, сколько дней я живу, сколько дней до дня рождения"
  >
    <div class="calc-form">
      <div class="calc-field">
        <label class="calc-label" for="birth">Дата рождения</label>
        <input id="birth" v-model="birth" type="date" class="calc-input" />
      </div>

      <div class="calc-field">
        <label class="calc-label" for="at">Возраст на дату</label>
        <input id="at" v-model="at" type="date" class="calc-input" />
      </div>

      <p v-if="error" class="calc-error">{{ error }}</p>

      <div class="calc-actions">
        <button class="calc-button" @click="setToday">Считать на сегодня</button>
      </div>
    </div>

    <div v-if="age && birthDate && atDate" class="calc-result">
      <p class="calc-result__main">
        {{ age.years }} {{ plural(age.years, ["год", "года", "лет"]) }},
        {{ age.months }}
        {{ plural(age.months, ["месяц", "месяца", "месяцев"]) }},
        {{ age.days }} {{ plural(age.days, ["день", "дня", "дней"]) }}
      </p>
      <p class="calc-result__sub">
        возраст на {{ formatLongDate(atDate) }}
      </p>

      <div class="calc-grid">
        <div class="calc-stat">
          <span class="calc-stat__value">{{ totalDays.toLocaleString("ru-RU") }}</span>
          <span class="calc-stat__label">прожито дней</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">
            {{ Math.floor(totalDays / 7).toLocaleString("ru-RU") }}
          </span>
          <span class="calc-stat__label">полных недель</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">
            {{ (age.years * 12 + age.months).toLocaleString("ru-RU") }}
          </span>
          <span class="calc-stat__label">полных месяцев</span>
        </div>
        <div class="calc-stat">
          <span class="calc-stat__value">{{ daysToBirthday }}</span>
          <span class="calc-stat__label">дней до дня рождения</span>
        </div>
      </div>

      <p v-if="nextBirthday" class="calc-note">
        Ближайший день рождения — {{ formatLongDate(nextBirthday) }}.
      </p>
    </div>

    <template #text>
      <h2>Как считается возраст</h2>
      <p>
        Возраст считается так же, как его определяют в документах: полное число
        лет отсчитывается от даты рождения, затем добираются полные месяцы и
        оставшиеся дни. Если в месяце расчёта день рождения ещё не наступил,
        месяц не засчитывается — недостающие дни берутся из предыдущего месяца.
      </p>
      <h3>Когда нужен точный возраст</h3>
      <ul>
        <li>оформление документов и льгот по возрасту;</li>
        <li>расчёт трудового стажа и права на пенсию;</li>
        <li>медицинские нормы, где важен возраст в месяцах;</li>
        <li>возрастные ограничения при трудоустройстве подростков.</li>
      </ul>
      <h3>Юридический нюанс</h3>
      <p>
        По российскому законодательству человек считается достигшим
        определённого возраста не в день рождения, а по его окончании — то есть
        с ноля часов следующих суток. На бытовые расчёты это не влияет, но
        имеет значение в правовых вопросах.
      </p>
    </template>
  </ToolLayout>
</template>

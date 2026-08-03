<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import ToolLayout from "@/components/ToolLayout.vue";

type Mode = "stopwatch" | "timer";

const mode = ref<Mode>("stopwatch");

// === Секундомер ===
const elapsed = ref(0); // миллисекунды
const running = ref(false);
const laps = ref<number[]>([]);
let rafId: number | null = null;
let startedAt = 0;

const tick = () => {
  elapsed.value = Date.now() - startedAt;
  rafId = requestAnimationFrame(tick);
};

const startStopwatch = () => {
  if (running.value) return;
  startedAt = Date.now() - elapsed.value;
  running.value = true;
  rafId = requestAnimationFrame(tick);
};

const stopStopwatch = () => {
  running.value = false;
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
};

const resetStopwatch = () => {
  stopStopwatch();
  elapsed.value = 0;
  laps.value = [];
};

const addLap = () => {
  if (running.value) laps.value = [elapsed.value, ...laps.value];
};

// === Таймер ===
const timerH = ref(0);
const timerM = ref(5);
const timerS = ref(0);
const remaining = ref(0); // миллисекунды
const timerRunning = ref(false);
const finished = ref(false);
let timerId: ReturnType<typeof setInterval> | null = null;

const startTimer = () => {
  if (timerRunning.value) return;
  if (remaining.value <= 0) {
    remaining.value =
      ((timerH.value || 0) * 3600 +
        (timerM.value || 0) * 60 +
        (timerS.value || 0)) *
      1000;
  }
  if (remaining.value <= 0) return;

  finished.value = false;
  timerRunning.value = true;
  const endsAt = Date.now() + remaining.value;

  timerId = setInterval(() => {
    remaining.value = Math.max(0, endsAt - Date.now());
    if (remaining.value === 0) {
      stopTimer();
      finished.value = true;
      playBeep();
    }
  }, 100);
};

const stopTimer = () => {
  timerRunning.value = false;
  if (timerId !== null) clearInterval(timerId);
  timerId = null;
};

const resetTimer = () => {
  stopTimer();
  remaining.value = 0;
  finished.value = false;
};

/** Короткий сигнал через Web Audio — без внешних файлов */
const playBeep = () => {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.6);
  } catch {
    // Звук недоступен — не критично
  }
};

onUnmounted(() => {
  stopStopwatch();
  stopTimer();
});

/** Формат 00:00:00.0 */
const format = (ms: number, withTenths = true): string => {
  const total = Math.floor(ms / 100);
  const tenths = total % 10;
  const seconds = Math.floor(total / 10);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const base = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return withTenths ? `${base}.${tenths}` : base;
};

const display = computed(() =>
  mode.value === "stopwatch"
    ? format(elapsed.value)
    : format(remaining.value, false),
);
</script>

<template>
  <ToolLayout
    slug="sekundomer-tajmer"
    title="Секундомер и таймер онлайн"
    description="Онлайн-секундомер с отсечками кругов и обратный таймер со звуковым сигналом. Работают прямо в браузере, ничего устанавливать не нужно."
    keywords="секундомер онлайн, таймер онлайн, обратный отсчёт, секундомер с кругами, таймер со звуком"
  >
    <div class="mode-switch">
      <button
        class="mode-button"
        :class="{ active: mode === 'stopwatch' }"
        @click="mode = 'stopwatch'"
      >
        Секундомер
      </button>
      <button
        class="mode-button"
        :class="{ active: mode === 'timer' }"
        @click="mode = 'timer'"
      >
        Таймер
      </button>
    </div>

    <div class="display" :class="{ finished }">{{ display }}</div>

    <!-- Секундомер -->
    <template v-if="mode === 'stopwatch'">
      <div class="controls">
        <button v-if="!running" class="primary" @click="startStopwatch">
          Старт
        </button>
        <button v-else class="primary" @click="stopStopwatch">Пауза</button>
        <button @click="addLap" :disabled="!running">Круг</button>
        <button @click="resetStopwatch">Сброс</button>
      </div>

      <ol v-if="laps.length" class="laps">
        <li v-for="(lap, i) in laps" :key="i">
          <span class="lap-number">Круг {{ laps.length - i }}</span>
          <span class="lap-time">{{ format(lap) }}</span>
        </li>
      </ol>
    </template>

    <!-- Таймер -->
    <template v-else>
      <div class="calc-form">
        <div class="calc-field">
          <label class="calc-label" for="th">Часы</label>
          <input id="th" v-model.number="timerH" type="number" min="0" max="99" class="calc-input" />
        </div>
        <div class="calc-field">
          <label class="calc-label" for="tm">Минуты</label>
          <input id="tm" v-model.number="timerM" type="number" min="0" max="59" class="calc-input" />
        </div>
        <div class="calc-field">
          <label class="calc-label" for="ts">Секунды</label>
          <input id="ts" v-model.number="timerS" type="number" min="0" max="59" class="calc-input" />
        </div>
      </div>

      <div class="controls">
        <button v-if="!timerRunning" class="primary" @click="startTimer">
          Старт
        </button>
        <button v-else class="primary" @click="stopTimer">Пауза</button>
        <button @click="resetTimer">Сброс</button>
      </div>

      <p v-if="finished" class="finished-note">Время вышло</p>
    </template>

    <template #text>
      <h2>Секундомер</h2>
      <p>
        Секундомер отсчитывает время с точностью до десятой доли секунды.
        Кнопка «Круг» фиксирует промежуточное время, не останавливая отсчёт —
        удобно для тренировок, замеров этапов работы или учебных заданий. Все
        отсечки сохраняются списком до нажатия «Сброс».
      </p>
      <h2>Таймер обратного отсчёта</h2>
      <p>
        Задайте часы, минуты и секунды и нажмите «Старт» — по окончании
        прозвучит короткий сигнал. Отсчёт привязан к системному времени, поэтому
        не сбивается, даже если вкладка браузера ушла в фоновый режим и
        замедлила таймеры.
      </p>
      <h3>Где пригодится</h3>
      <ul>
        <li>работа по методу Помодоро — 25 минут работы, 5 минут отдыха;</li>
        <li>тренировки с интервалами и замеры кругов;</li>
        <li>кухонный таймер;</li>
        <li>ограничение времени на выступление или тест.</li>
      </ul>
      <p>
        Секундомер и таймер работают полностью в браузере: данные никуда не
        отправляются, интернет после загрузки страницы не нужен.
      </p>
    </template>
  </ToolLayout>
</template>

<style scoped>
.mode-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.mode-button {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.mode-button.active {
  background-color: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.display {
  padding: 32px 20px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 3rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--color-text);
  margin-bottom: 16px;
}

.display.finished {
  color: var(--color-holiday-official);
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.controls button {
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.controls button:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.controls button:disabled {
  opacity: 0.5;
  cursor: default;
}

.controls .primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.controls .primary:hover {
  background-color: var(--color-primary-hover);
  color: #fff;
}

.laps {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  max-height: 260px;
  overflow-y: auto;
}

.laps li {
  display: flex;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
}

.laps li:last-child {
  border-bottom: none;
}

.lap-number {
  color: var(--color-text-muted);
}

.lap-time {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.finished-note {
  margin: 0 0 16px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-holiday-official);
}

@media (max-width: 600px) {
  .display {
    font-size: 2.25rem;
  }
}
</style>

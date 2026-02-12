#!/usr/bin/env node

/**
 * Скрипт для загрузки производственного календаря с xmlcalendar.ru
 * Запускается перед билдом: node scripts/fetch-production-calendar.mjs
 *
 * Сохраняет данные в src/data/production-calendar.json
 */

import { writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "../src/data/production-calendar.json");

const BASE_URL = "https://xmlcalendar.ru/data/ru";
const currentYear = new Date().getFullYear();
const START_YEAR = currentYear - 2; // два года назад
const END_YEAR = currentYear + 1; // следующий год

/**
 * Загружает календарь для одного года
 * @returns {Promise<object|null>}
 */
async function fetchYear(year) {
  const url = `${BASE_URL}/${year}/calendar.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

async function main() {
  console.log(
    `Загрузка производственного календаря (${START_YEAR}–${END_YEAR})...`,
  );

  const result = {};
  let fetched = 0;

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const data = await fetchYear(year);
    if (data && data.months) {
      result[year] = { months: data.months };
      fetched++;
      console.log(`  ✓ ${year}`);
    } else {
      console.log(`  ✗ ${year} (нет данных)`);
    }
  }

  if (fetched > 0) {
    writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + "\n", "utf-8");
    console.log(
      `\nГотово: загружено ${fetched} из ${END_YEAR - START_YEAR + 1}`,
    );
    console.log(`Сохранено: ${OUTPUT_PATH}`);
  } else if (existsSync(OUTPUT_PATH)) {
    console.log("\nСервис недоступен, используем существующий файл.");
  } else {
    writeFileSync(OUTPUT_PATH, "{}\n", "utf-8");
    console.log("\nСервис недоступен, данных нет. Создан пустой файл.");
  }
}

main().catch((err) => {
  console.error("Ошибка:", err);
  process.exit(1);
});

# Календарь на год

Веб-приложение для просмотра календаря на год, написанное на Vue 3 + TypeScript.

## Возможности

- Просмотр календаря любого года (1900–2100)
- Сетка 3×4 с мини-календарями всех 12 месяцев
- Выделение выходных дней красным цветом
- Подсветка текущего дня
- Боковое меню для быстрого переключения между годами
- Адаптивная верстка (desktop, tablet, mobile)
- Печать календаря

## Запуск

```bash
npm install
npm run dev
```

Приложение будет доступно по адресу http://localhost:5173

## Сборка для продакшена

```bash
npm run build
npm run preview
```

## Структура проекта

```
src/
├── assets/
│   └── styles/
│       └── main.css        # Глобальные стили и print CSS
├── components/
│   ├── MonthCard.vue       # Карточка одного месяца
│   ├── MonthGrid.vue       # Сетка из 12 месяцев
│   └── SidebarYearPicker.vue # Боковое меню выбора года
├── router/
│   └── index.ts            # Маршрутизация
├── types/
│   └── calendar.ts         # TypeScript типы
├── utils/
│   └── date.ts             # Утилиты для работы с датами
├── views/
│   └── YearCalendarPage.vue # Основная страница
├── App.vue                 # Корневой компонент
└── main.ts                 # Точка входа
```

## Расширение функционала

### Добавление праздников

1. Создайте файл `src/data/holidays.ts`:

```typescript
export interface Holiday {
  date: string; // формат: MM-DD
  name: string;
  type: "national" | "regional";
}

export const holidays: Record<string, Holiday[]> = {
  RU: [
    { date: "01-01", name: "Новый год", type: "national" },
    { date: "01-07", name: "Рождество", type: "national" },
    // ...
  ],
};
```

2. Расширьте тип `MonthCell` в `src/types/calendar.ts`:

```typescript
export interface MonthCell {
  // ... существующие поля
  holiday?: string;
}
```

3. Обновите функцию `buildMonthMatrix` в `src/utils/date.ts` для проверки праздников

4. Добавьте стили для праздничных дней в `MonthCard.vue`

### Добавление событий пользователя

Для хранения пользовательских событий можно использовать:

- Pinia store + localStorage
- IndexedDB для больших объемов данных

## Технологии

- Vue 3 (Composition API)
- TypeScript
- Vite
- Vue Router
- CSS (без UI-библиотек)

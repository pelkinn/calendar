import { ref, readonly, computed } from "vue";

const STORAGE_KEY = "calendar-selected-dates";

/**
 * Загрузить выбранные даты из localStorage
 */
function loadSelectedDates(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((d: unknown) => typeof d === "string"));
      }
    }
  } catch {
    // ignore
  }
  return new Set();
}

/**
 * Сохранить выбранные даты в localStorage
 */
function saveSelectedDates(dates: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(dates)));
  } catch {
    // ignore
  }
}

/**
 * Composable для управления выбранными датами
 */
const selectedDates = ref<Set<string>>(loadSelectedDates());

export function useSelectedDate() {
  /**
   * Переключить выбор даты (добавить/убрать)
   * @param date - дата в формате ISO (YYYY-MM-DD)
   */
  const toggleDate = (date: string | null) => {
    if (!date) return;

    const newSet = new Set(selectedDates.value);
    if (newSet.has(date)) {
      newSet.delete(date);
    } else {
      newSet.add(date);
    }
    selectedDates.value = newSet;
    saveSelectedDates(newSet);
  };

  /**
   * Сбросить выбор всех дат
   */
  const clearSelection = () => {
    selectedDates.value = new Set();
    saveSelectedDates(selectedDates.value);
  };

  /**
   * Проверить, выбрана ли дата
   */
  const isSelected = (date: string | null): boolean => {
    if (!date) return false;
    return selectedDates.value.has(date);
  };

  /**
   * Количество выбранных дат
   */
  const selectedCount = computed(() => selectedDates.value.size);

  /**
   * Список выбранных дат (отсортированный)
   */
  const selectedList = computed(() => Array.from(selectedDates.value).sort());

  return {
    selectedDates: readonly(selectedDates),
    selectedCount,
    selectedList,
    toggleDate,
    clearSelection,
    isSelected,
  };
}

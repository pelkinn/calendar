import { ref, readonly, computed } from "vue";

/**
 * Composable для управления выбранными датами
 */
const selectedDates = ref<Set<string>>(new Set());

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
  };

  /**
   * Сбросить выбор всех дат
   */
  const clearSelection = () => {
    selectedDates.value = new Set();
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

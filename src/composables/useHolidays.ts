import { ref, readonly } from "vue";

/**
 * Composable для управления отображением праздников
 */
const showHolidays = ref<boolean>(loadShowHolidays());

function loadShowHolidays(): boolean {
  try {
    const saved = localStorage.getItem("show-holidays");
    return saved === "true";
  } catch {
    return false;
  }
}

function saveShowHolidays(value: boolean): void {
  try {
    localStorage.setItem("show-holidays", String(value));
  } catch {
    // ignore
  }
}

export function useHolidays() {
  const toggleHolidays = () => {
    showHolidays.value = !showHolidays.value;
    saveShowHolidays(showHolidays.value);
  };

  return {
    showHolidays: readonly(showHolidays),
    toggleHolidays,
  };
}

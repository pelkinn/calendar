import { ref, watch, onMounted } from "vue";

export type Theme = "light" | "dark";

const STORAGE_KEY = "calendar-theme";

// Глобальное состояние темы (синглтон)
const theme = ref<Theme>("light");

export function useTheme() {
  // Применить тему к документу
  const applyTheme = (newTheme: Theme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Переключить тему
  const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
  };

  // Установить конкретную тему
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
  };

  // Инициализация темы из localStorage или системных настроек
  const initTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;

    if (stored && (stored === "light" || stored === "dark")) {
      theme.value = stored;
    } else {
      // Проверяем системные настройки
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      theme.value = prefersDark ? "dark" : "light";
    }

    applyTheme(theme.value);
  };

  // Следим за изменениями и сохраняем в localStorage
  watch(theme, (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  });

  return {
    theme,
    toggleTheme,
    setTheme,
    initTheme,
  };
}

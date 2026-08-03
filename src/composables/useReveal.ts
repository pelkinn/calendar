import { onMounted, onUnmounted } from "vue";

/**
 * Появление блоков с классом .reveal при попадании во вьюпорт.
 *
 * Прогрессивное улучшение: скрывает блоки только правило `.js .reveal`,
 * а класс .js ставится здесь же. Без JS (и если этот код упадёт)
 * содержимое остаётся видимым — для поискового трафика это критично.
 */
export function useReveal() {
  let io: IntersectionObserver | null = null;
  let mo: MutationObserver | null = null;
  let queued = false;

  const scan = () => {
    if (!io) return;
    document
      .querySelectorAll<HTMLElement>(".reveal:not(.is-visible)")
      .forEach((el) => io!.observe(el));
  };

  /** Смена страницы сыплет мутациями пачкой — хватит одного скана на кадр */
  const scheduleScan = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  };

  onMounted(() => {
    const root = document.documentElement;

    // Уважаем системную настройку: показываем всё сразу, без наблюдателей
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document
        .querySelectorAll<HTMLElement>(".reveal")
        .forEach((el) => el.classList.add("is-visible"));
      return;
    }

    root.classList.add("js");

    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          // Небольшая лесенка, чтобы соседние блоки не вспыхивали разом
          window.setTimeout(
            () => entry.target.classList.add("is-visible"),
            (i % 6) * 45,
          );
          io?.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    scan();

    /*
     * Подписываемся на появление узлов, а не на router.afterEach:
     * при <Transition mode="out-in"> новая страница монтируется уже после
     * afterEach, поэтому скан по хуку роутера находил пустой DOM и блоки
     * навсегда оставались скрытыми.
     */
    mo = new MutationObserver(scheduleScan);
    mo.observe(document.body, { childList: true, subtree: true });
  });

  onUnmounted(() => {
    io?.disconnect();
    io = null;
    mo?.disconnect();
    mo = null;
  });
}

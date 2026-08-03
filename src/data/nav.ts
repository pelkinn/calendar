/**
 * Главное меню сайта.
 * Один источник правды для шапки и футера, чтобы разделы не расходились.
 */
import { getCurrentYear } from "@/utils/date";
import { TOOLS_BASE } from "./tools";
import { HOLIDAYS_BASE } from "./holidayPages";
import { ARTICLES_BASE } from "./articles";

export interface NavItem {
  label: string;
  /** Куда ведёт пункт */
  to: string;
  /** Префикс пути, по которому пункт считается активным */
  match: string;
}

/**
 * Год подставляется на этапе рендера, поэтому меню — функция, а не константа:
 * при пре-рендере статики каждый год должен попасть в свои страницы актуальным.
 */
export function getNavItems(): NavItem[] {
  const year = getCurrentYear();
  return [
    { label: "Календарь", to: `/year/${year}`, match: "/year" },
    { label: "Норма времени", to: "/norma", match: "/norma" },
    { label: "Праздники", to: HOLIDAYS_BASE, match: HOLIDAYS_BASE },
    { label: "Калькуляторы", to: TOOLS_BASE, match: TOOLS_BASE },
    { label: "Статьи", to: ARTICLES_BASE, match: ARTICLES_BASE },
  ];
}

/** Активен ли пункт для текущего пути */
export function isNavItemActive(item: NavItem, path: string): boolean {
  return path === item.match || path.startsWith(`${item.match}/`);
}

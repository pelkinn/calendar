import { type RouteRecordRaw } from "vue-router";
import { getCurrentYear } from "@/utils/date";
import YearCalendarPage from "@/views/YearCalendarPage.vue";
import { TOOLS, TOOLS_BASE, toolPath } from "@/data/tools";
import {
  HOLIDAY_PAGES,
  HOLIDAYS_BASE,
  holidayPath,
} from "@/data/holidayPages";
import { MONTHS, MONTH_PAGE_YEARS, monthPath } from "@/data/months";
import { ARTICLES, ARTICLES_BASE, articlePath } from "@/data/articles";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: () => `/year/${getCurrentYear()}`,
  },
  {
    path: "/year/:year",
    name: "year-calendar",
    component: YearCalendarPage,
    props: (route) => ({
      year: parseInt(route.params.year as string, 10),
    }),
  },
  // Страницы месяцев: /year/2026/yanvar
  ...MONTH_PAGE_YEARS.flatMap((year) =>
    MONTHS.map(
      (month): RouteRecordRaw => ({
        path: monthPath(year, month),
        name: `month-${year}-${month.slug}`,
        component: () => import("@/views/MonthPage.vue"),
        props: { year, month },
      }),
    ),
  ),
  {
    path: "/norma",
    name: "work-time-norm-index",
    component: () => import("@/views/WorkTimeNormIndexPage.vue"),
  },
  {
    path: "/norma/:year",
    name: "work-time-norm",
    component: () => import("@/views/WorkTimeNormPage.vue"),
    props: (route) => ({
      year: parseInt(route.params.year as string, 10),
    }),
  },
  {
    path: TOOLS_BASE,
    name: "tools-index",
    component: () => import("@/views/ToolsIndexPage.vue"),
  },
  // Калькуляторы: маршрут на каждый инструмент из каталога
  ...TOOLS.map(
    (tool): RouteRecordRaw => ({
      path: toolPath(tool),
      name: `tool-${tool.slug}`,
      component: () => import(`@/views/tools/${tool.view}.vue`),
    }),
  ),
  {
    path: HOLIDAYS_BASE,
    name: "holidays-index",
    component: () => import("@/views/HolidaysIndexPage.vue"),
  },
  // Праздники: одна вьюха, данные приходят пропсом из каталога
  ...HOLIDAY_PAGES.map(
    (page): RouteRecordRaw => ({
      path: holidayPath(page),
      name: `holiday-${page.slug}`,
      component: () => import("@/views/HolidayPage.vue"),
      props: { page },
    }),
  ),
  {
    path: ARTICLES_BASE,
    name: "articles-index",
    component: () => import("@/views/ArticlesIndexPage.vue"),
  },
  // Статьи: одна вьюха, содержимое приходит пропсом
  ...ARTICLES.map(
    (article): RouteRecordRaw => ({
      path: articlePath(article),
      name: `article-${article.slug}`,
      component: () => import("@/views/ArticlePage.vue"),
      props: { article },
    }),
  ),
  {
    // Любой другой путь — редирект на текущий год
    path: "/:pathMatch(.*)*",
    redirect: () => `/year/${getCurrentYear()}`,
  },
];

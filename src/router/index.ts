import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { getCurrentYear } from "@/utils/date";
import YearCalendarPage from "@/views/YearCalendarPage.vue";

const routes: RouteRecordRaw[] = [
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
  {
    // Любой другой путь — редирект на текущий год
    path: "/:pathMatch(.*)*",
    redirect: () => `/year/${getCurrentYear()}`,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

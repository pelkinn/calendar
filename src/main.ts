import { ViteSSG } from "vite-ssg";
import App from "./App.vue";
import { routes } from "./router/index";
import "./assets/styles/main.css";

// vite-ssg автоматически подключает @unhead/vue (client/server в зависимости от контекста)
export const createApp = ViteSSG(App, {
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Назад — на прежнее место, якорь — к якорю, иначе наверх
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    if (to.path === from.path) return false;
    return { top: 0 };
  },
});

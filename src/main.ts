import { ViteSSG } from "vite-ssg";
import App from "./App.vue";
import { routes } from "./router/index";
import "./assets/styles/main.css";

// vite-ssg автоматически подключает @unhead/vue (client/server в зависимости от контекста)
export const createApp = ViteSSG(App, { routes });

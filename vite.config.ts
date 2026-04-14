import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import type { ViteSSGOptions } from "vite-ssg";

interface ViteConfigWithSSG {
  ssgOptions?: ViteSSGOptions;
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  ...({
    ssgOptions: {
      script: "async",
      formatting: "minify",
      includedRoutes() {
        // Пре-рендерим ключевые годы для SEO
        const years = [2024, 2025, 2026, 2027, 2028];
        return ["/", ...years.map((y) => `/year/${y}`)];
      },
    },
  } satisfies ViteConfigWithSSG),
});

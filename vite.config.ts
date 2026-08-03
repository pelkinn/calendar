import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { writeFileSync } from "node:fs";
import type { ViteSSGOptions } from "vite-ssg";
import { SEO_YEAR_START, SEO_YEAR_END } from "./src/types/calendar";
import productionCalendar from "./src/data/production-calendar.json";
import { TOOLS, TOOLS_BASE, toolPath } from "./src/data/tools";
import {
  HOLIDAY_PAGES,
  HOLIDAYS_BASE,
  holidayPath,
} from "./src/data/holidayPages";
import { MONTHS, MONTH_PAGE_YEARS, monthPath } from "./src/data/months";
import { ARTICLES, ARTICLES_BASE, articlePath } from "./src/data/articles";

interface ViteConfigWithSSG {
  ssgOptions?: ViteSSGOptions;
}

const SITE_URL = "https://calendar-online.online";

const seoYears = Array.from(
  { length: SEO_YEAR_END - SEO_YEAR_START + 1 },
  (_, i) => SEO_YEAR_START + i,
);

// Нормы рабочего времени считаются только по годам с производственным
// календарём — иначе цифры будут без учёта переносов выходных
const normYears = Object.keys(productionCalendar).map(Number).sort();

/** Все маршруты сайта — источник и для пре-рендера, и для sitemap */
const staticRoutes = [
  "/",
  ...seoYears.map((y) => `/year/${y}`),
  "/norma",
  ...normYears.map((y) => `/norma/${y}`),
  TOOLS_BASE,
  ...TOOLS.map((tool) => toolPath(tool)),
  HOLIDAYS_BASE,
  ...HOLIDAY_PAGES.map((page) => holidayPath(page)),
  ...MONTH_PAGE_YEARS.flatMap((year) =>
    MONTHS.map((month) => monthPath(year, month)),
  ),
  ARTICLES_BASE,
  ...ARTICLES.map((article) => articlePath(article)),
];

/**
 * Sitemap генерируется из того же списка, что и пре-рендер, —
 * чтобы в нём не оказалось страниц, которых нет в статике.
 */
function writeSitemap() {
  const currentYear = new Date().getFullYear();
  const lastmod = new Date().toISOString().slice(0, 10);

  // Приоритет тем выше, чем ближе год к текущему; разделы-хабы — отдельно
  const urls = staticRoutes.map((route) => {
    const year = Number(route.match(/\d{4}$/)?.[0]);

    if (!year) {
      return {
        loc: `${SITE_URL}${route}`,
        priority: route === "/" ? "1.0" : "0.8",
        changefreq: "monthly",
      };
    }

    const distance = Math.abs(year - currentYear);
    return {
      loc: `${SITE_URL}${route}`,
      priority: distance === 0 ? "0.9" : distance <= 2 ? "0.7" : "0.4",
      changefreq: year >= currentYear ? "monthly" : "yearly",
    };
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  writeFileSync(
    fileURLToPath(new URL("./dist/sitemap.xml", import.meta.url)),
    xml,
  );
  console.log(`sitemap.xml: ${urls.length} URL`);
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
        return staticRoutes;
      },
      onFinished() {
        writeSitemap();
      },
    },
  } satisfies ViteConfigWithSSG),
});

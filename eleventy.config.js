import { HtmlBasePlugin } from "@11ty/eleventy";
import site from "./site/_data/site.js";
import { loadMeetingTypes, parseMinutesPath, formatDate, toIsoDate } from "./scripts/lib.mjs";

const meetingTypes = loadMeetingTypes();
const typeById = Object.fromEntries(meetingTypes.map((t) => [t.id, t]));

const byDateDesc = (a, b) =>
  (b.data.meetingDate || "").localeCompare(a.data.meetingDate || "") ||
  (b.data.meetingLabel || "").localeCompare(a.data.meetingLabel || "");

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Only the site and the minutes are part of the build.
  for (const p of ["README.md", "CONTRIBUTING.md", "templates/**", ".github/**", "scripts/**", "node_modules/**"]) {
    eleventyConfig.ignores.add(p);
  }

  eleventyConfig.addPassthroughCopy({ "site/assets": "assets" });
  // Word-to-Markdown conversion for the "Add minutes" page (loaded only when a .docx is chosen).
  eleventyConfig.addPassthroughCopy({
    "node_modules/mammoth/mammoth.browser.min.js": "assets/vendor/mammoth.browser.min.js",
    "node_modules/turndown/lib/turndown.browser.umd.js": "assets/vendor/turndown.js",
    "node_modules/turndown-plugin-gfm/dist/turndown-plugin-gfm.js": "assets/vendor/turndown-plugin-gfm.js",
  });
  eleventyConfig.addWatchTarget("site/assets/");

  eleventyConfig.addCollection("minutes", (api) =>
    api.getFilteredByGlob("minutes/**/*.md").filter((item) => parseMinutesPath(item.inputPath)?.date).sort(byDateDesc)
  );

  eleventyConfig.addFilter("formatDate", formatDate);
  eleventyConfig.addFilter("meetingType", (id) => typeById[id] || { id, name: id, color: "#555" });
  eleventyConfig.addFilter("ofType", (items, type) => items.filter((i) => i.data.meetingType === type));
  eleventyConfig.addFilter("years", (items) => [...new Set(items.map((i) => i.data.meetingYear))]);
  eleventyConfig.addFilter("inYear", (items, year) => items.filter((i) => i.data.meetingYear === year));
  eleventyConfig.addFilter("plainText", (html = "") =>
    String(html)
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z#0-9]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
  eleventyConfig.addFilter("neighbors", (items, url) => {
    const i = items.findIndex((x) => x.url === url);
    return { newer: items[i - 1], older: items[i + 1] };
  });
  eleventyConfig.addFilter("head", (arr, n) => arr.slice(0, n));
  eleventyConfig.addFilter("isoDate", toIsoDate);
  eleventyConfig.addFilter("githubEditUrl", (inputPath) => `${site.repo}/edit/main/${inputPath.replace(/^\.\//, "")}`);
  eleventyConfig.addFilter("isoDateTime", (iso) => `${iso}T00:00:00Z`);

  return {
    dir: { input: ".", includes: "site/_includes", data: "site/_data", output: "_site" },
    markdownTemplateEngine: false, // minutes are plain Markdown; no template code runs inside them
    htmlTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}

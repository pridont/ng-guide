const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const MarkdownIt = require("markdown-it");
const { execSync } = require("child_process");
const mdAnchor = require("markdown-it-anchor");
const mdHighlightjs = require("markdown-it-highlightjs");
const filterArticles = require("./util/sort-articles");
const bookSummary = require("./util/summary");
const gitDates = require("./util/git-dates");
const codeFence = require("./util/code-fence");

const REPO = "https://github.com/CondensedMilk7/ng-guide";

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/styles");
  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy("./src/scripts");

  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  eleventyConfig.addFilter("shorten", (path) => {
    if (path.length > 16) {
      return path.substring(0, 16) + "...";
    } else {
      return path;
    }
  });

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // cuts out the starting '/articles' from output url
  eleventyConfig.addFilter("rootify", (url) => {
    return url.replace("/articles", "/");
  });

  // Book outline rendered straight from SUMMARY.md, current page marked.
  eleventyConfig.addFilter("sidenav", (page) => bookSummary.render(page));

  // Breadcrumbs, chapter/page numbers and prev/next links for one page.
  eleventyConfig.addFilter("bookNav", (page) => bookSummary.nav(page));

  // Date of the last commit that touched the page's source file.
  eleventyConfig.addFilter("updatedOn", (inputPath) => {
    const date = gitDates.lastModified(inputPath);
    if (!date) return null;
    return DateTime.fromJSDate(date)
      .setLocale("ka")
      .toLocaleString(DateTime.DATE_FULL);
  });

  // Cloudflare serves the assets extensionless and redirects the `.html` form,
  // so sitemap.xml must list the url the redirect lands on.
  eleventyConfig.addFilter("canonical", (url) => url.replace(/\.html$/, ""));

  // Same date as `updatedOn`, in the ISO form sitemap.xml expects.
  eleventyConfig.addFilter("lastmod", (inputPath) => {
    const date = gitDates.lastModified(inputPath);
    if (!date) return null;
    return DateTime.fromJSDate(date).toISODate();
  });

  eleventyConfig.addFilter("editUrl", (inputPath) => {
    if (!inputPath) return REPO;
    return `${REPO}/edit/master/${inputPath.replace(/^\.\//, "")}`;
  });

  // The layout renders the page title itself, so the article's own leading
  // `# Title` heading is dropped from the body.
  eleventyConfig.addFilter("stripTitle", (html) =>
    String(html).replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, "")
  );

  eleventyConfig.addFilter("issueUrl", (title) => {
    const subject = encodeURIComponent(`შეცდომა: ${title || ""}`.trim());
    return `${REPO}/issues/new?title=${subject}`;
  });

  eleventyConfig.on("eleventy.after", () => {
    execSync(`npx pagefind --site public --glob \"**/*.html\"`, {
      encoding: "utf-8",
    });
  });

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });
  md.use(mdAnchor, { permalink: mdAnchor.permalink.headerLink() });

  md.use(mdHighlightjs, { auto: false });

  // Must come after the highlighter so it wraps the highlighted <pre>.
  codeFence.install(md);

  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addCollection("sortedArticles", filterArticles);

  return {
    dir: {
      input: "src",
      output: "public",
      includes: "includes/partials",
      layouts: "includes/layouts",
    },
  };
};

const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const MarkdownIt = require("markdown-it");
const { execSync } = require("child_process");
const mdAnchor = require("markdown-it-anchor");
const mdHighlightjs = require("markdown-it-highlightjs");
const filterArticles = require("./util/sort-articles");

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

  eleventyConfig.addFilter("summary", (mdString, page) => {
    const md = new MarkdownIt({ html: true });
    const html = md.render(mdString);
    targetAttr = `href="${page.outputPath.replace("public/", "/")}"`;
    return html.replace(
      targetAttr,
      targetAttr + " " + 'class="active" aria-current="page"'
    );
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

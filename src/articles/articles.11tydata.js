/*
 * `templateEngineOverride: "md"` turns Liquid off for these files, because the
 * articles are full of Angular interpolation (`{{ user.name }}`) that Liquid
 * would otherwise try to evaluate. That leaves no engine to render template
 * syntax in `permalink` either, so the output path is computed here instead.
 */
module.exports = {
  templateEngineOverride: "md",
  tags: "articles",
  layout: "base",
  // `/articles/http/index` -> `/http/index.html`
  permalink: (data) =>
    `${data.page.filePathStem.replace("/articles", "")}.html`,
};

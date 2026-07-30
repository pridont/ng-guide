const { order } = require("./summary");

function filterArticles(collectionsApi) {
  const articles = collectionsApi.getFilteredByTag("articles");
  const byUrl = new Map(
    articles.map((article) => [
      article.outputPath.replace(/^\.?\/?public\//, "/"),
      article,
    ])
  );

  return order()
    .map((url) => byUrl.get(url))
    .filter(
      (article) => article && !article.outputPath.endsWith("contributors.html")
    );
}

module.exports = filterArticles;

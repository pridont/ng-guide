/*
 * The whole screen stylesheet is ~27 KB of source, small enough to ship inside
 * the document. Inlining it removes nine render-blocking requests plus the
 * round-trip `main.css`'s `@import` used to add for `tokens.css`, so first
 * paint no longer waits on the network at all.
 *
 * `print.css` stays a linked file (behind `media="print"`) and pagefind's
 * stylesheet is injected with its script the first time search opens.
 */
const fs = require("fs");
const path = require("path");
const CleanCSS = require("clean-css");

const STYLES = path.join(__dirname, "..", "src", "styles");

// Cascade order, matching the old <link> order. `tokens.css` has to come first
// because every sheet after it reads its custom properties.
const FILES = [
  "tokens.css",
  "main.css",
  "animations.css",
  "elements/article.css",
  "elements/header.css",
  "elements/footer.css",
  "elements/search.css",
  "highlight-theme.css",
];

/*
 * Level 1 only. Level 2 merges and reorders rules across the sheet, which this
 * cascade cannot take: the light palette in `tokens.css` and pagefind's
 * overrides in `search.css` both win on source order alone.
 */
const cleaner = new CleanCSS({ level: 1 });

let cache = null;

/** Concatenated, minified screen CSS. Built once per Eleventy run. */
function build() {
  if (cache) return cache;

  const source = FILES.map((file) =>
    fs.readFileSync(path.join(STYLES, file), "utf-8"),
  ).join("\n");

  const output = cleaner.minify(source);
  if (output.errors.length) {
    throw new Error(`css-bundle: ${output.errors.join(", ")}`);
  }

  cache = output.styles;
  return cache;
}

/** Dropped before every build so `--serve` picks up stylesheet edits. */
function reset() {
  cache = null;
}

module.exports = { build, reset, FILES };

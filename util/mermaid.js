/*
 * Renders ```mermaid fences to SVG at build time, so no diagram library ships
 * to the browser and diagrams survive both printing and JavaScript being off.
 *
 * Each diagram is rendered once per palette. Mermaid bakes colours into the
 * SVG, and the site's theme toggle is pure CSS with no JS subscribers, so both
 * copies go into the page and `article.css` shows whichever matches the theme.
 *
 * Results are cached in `.temp/` by content hash: a rebuild that changes no
 * diagram never launches the browser.
 */
const { createHash } = require("crypto");
const { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } = require("fs");
const { readdirSync } = require("fs");
const path = require("path");

/*
 * Committed on purpose. The site is built on Cloudflare's CI, whose image has
 * no Chromium shared libraries, so the deploy build must find every diagram
 * already rendered. `pnpm run diagrams` refreshes this directory locally.
 */
const CACHE_DIR = "diagrams";
const TOKENS_CSS = path.join("src", "styles", "tokens.css");
const FONT_DIR = path.join("src", "assets", "fonts");
const THEMES = ["dark", "light"];

/* Bump to invalidate every cached SVG after changing the render config. */
const CONFIG_VERSION = "3";

const FONT_STACK = '"Noto Sans", "Noto Sans Georgian", system-ui, sans-serif';

/* Rendered SVG by `${sha(source)}:${theme}`. Filled by prepare(). */
const rendered = new Map();

const FENCE = /^[ \t]*```mermaid[^\n]*\n([\s\S]*?)^[ \t]*```/gm;

/* ------------------------------------------------------------- palettes -- */

/*
 * Only primitives are read. `--accent` and `--link` are `var()` aliases
 * declared once on `:root`, so the light block never redeclares them — reading
 * them would silently hand back the dark theme's colour.
 */
const PRIMITIVES = [
  "--bg",
  "--panel",
  "--fg",
  "--muted",
  "--apricot",
  "--lilac",
  "--cyan",
];

function declarations(css, selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`${TOKENS_CSS}: no ${selector} block`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const out = {};
  for (const line of css.slice(open + 1, close).split("\n")) {
    const match = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);/);
    if (match) out[match[1]] = match[2].trim();
  }
  return out;
}

function palettes() {
  const css = readFileSync(TOKENS_CSS, "utf-8");
  const dark = declarations(css, ":root {");
  const light = declarations(css, ':root[data-theme="light"]');

  return Object.fromEntries(
    THEMES.map((theme) => {
      const source = theme === "dark" ? dark : light;
      const palette = {};
      for (const name of PRIMITIVES) {
        const value = source[name];
        if (!value) throw new Error(`${TOKENS_CSS}: ${theme} is missing ${name}`);
        palette[name.slice(2)] = value;
      }
      return [theme, palette];
    }),
  );
}

/* --------------------------------------------------------------- config -- */

/*
 * Mermaid derives ~150 more variables from these with colour maths, which only
 * accepts opaque colours — hence `--muted` for borders rather than the `rgba()`
 * `--rule` the rest of the site uses.
 */
function config(theme, palette) {
  const { bg, panel, fg, muted, apricot, lilac, cyan } = palette;

  return {
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    fontFamily: FONT_STACK,
    // SVG <text> instead of <foreignObject>, which Safari has dropped from its
    // print path in the past.
    flowchart: { htmlLabels: false, useMaxWidth: true },
    /*
     * Diagrams are capped at the 40rem prose measure, so a wide one is scaled
     * down and its labels shrink with it. Narrower lanes and no mirrored actor
     * row keep that scale factor close to 1.
     */
    sequence: {
      useMaxWidth: true,
      actorFontFamily: FONT_STACK,
      width: 120,
      actorMargin: 30,
      mirrorActors: false,
    },
    themeVariables: {
      darkMode: theme === "dark",
      fontFamily: FONT_STACK,
      fontSize: "15px",
      background: bg,

      primaryColor: panel,
      primaryTextColor: fg,
      primaryBorderColor: muted,
      secondaryColor: panel,
      secondaryTextColor: fg,
      secondaryBorderColor: muted,
      tertiaryColor: bg,
      tertiaryTextColor: muted,
      tertiaryBorderColor: muted,

      mainBkg: panel,
      nodeBorder: muted,
      nodeTextColor: fg,
      clusterBkg: bg,
      clusterBorder: muted,
      lineColor: muted,
      defaultLinkColor: muted,
      arrowheadColor: muted,
      textColor: fg,
      titleColor: fg,
      edgeLabelBackground: bg,

      actorBkg: panel,
      actorBorder: muted,
      actorTextColor: fg,
      actorLineColor: muted,
      signalColor: fg,
      signalTextColor: fg,
      labelBoxBkgColor: panel,
      labelBoxBorderColor: muted,
      labelTextColor: fg,
      loopTextColor: fg,
      activationBkgColor: panel,
      activationBorderColor: apricot,
      sequenceNumberColor: bg,
      noteBkgColor: panel,
      noteTextColor: fg,
      noteBorderColor: lilac,

      pie1: apricot,
      pie2: lilac,
      pie3: cyan,
    },
  };
}

/* ---------------------------------------------------------------- cache -- */

function key(source, theme) {
  const version = require("mermaid/package.json").version;
  const hash = createHash("sha256")
    .update([source, theme, version, CONFIG_VERSION].join("\0"))
    .digest("hex")
    .slice(0, 16);
  return `${hash}-${theme}`;
}

/* ---------------------------------------------------------------- scan --- */

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

/** Every distinct diagram source in the book, with a file for error messages. */
function collect() {
  const found = new Map();
  for (const file of walk("src")) {
    const text = readFileSync(file, "utf-8");
    for (const match of text.matchAll(FENCE)) {
      const source = match[1].trimEnd();
      if (!found.has(source)) found.set(source, file);
    }
  }
  return found;
}

/* --------------------------------------------------------------- render -- */

function fontFace(family, file) {
  const data = readFileSync(path.join(FONT_DIR, file)).toString("base64");
  return `@font-face{font-family:"${family}";font-style:normal;font-weight:400;src:url(data:font/woff2;base64,${data}) format("woff2");}`;
}

/*
 * The fonts are inlined rather than left to the system: Mermaid measures every
 * label against the live DOM and writes fixed positions into the SVG, so a
 * machine without Noto Sans Georgian installed would size every Georgian label
 * against a fallback face and the text would spill out of its box.
 */
function harness() {
  return `<!doctype html><meta charset="utf-8"><style>
${fontFace("Noto Sans", "noto-sans-latin-400.woff2")}
${fontFace("Noto Sans Georgian", "noto-sans-georgian-georgian-400.woff2")}
body{font-family:${FONT_STACK};margin:0;}
</style><body></body>`;
}

async function launch() {
  try {
    return await require("puppeteer").launch();
  } catch (err) {
    throw new Error(
      "mermaid: some diagrams are not in the committed `diagrams/` cache and " +
        "Chromium could not be launched to render them.\n" +
        "Run `pnpm run diagrams` locally and commit the result — the deploy " +
        "build cannot render diagrams itself.\n" +
        "If Chromium is missing locally: npx puppeteer browsers install chrome\n\n" +
        err.message,
    );
  }
}

async function renderMissing(missing, sources) {
  const palette = palettes();

  const browser = await launch();
  try {
    const page = await browser.newPage();
    await page.setContent(harness(), { waitUntil: "load" });
    await page.addScriptTag({
      path: require.resolve("mermaid/dist/mermaid.min.js"),
    });

    // `document.fonts.ready` only settles for faces already in use, so both are
    // requested explicitly — the Georgian one needs Georgian sample text to
    // match its unicode-range.
    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load('400 15px "Noto Sans"', "Aa"),
        document.fonts.load('400 15px "Noto Sans Georgian"', "ა"),
      ]);
      await document.fonts.ready;
    });

    // Grouped by theme so initialize() runs once per palette rather than per
    // diagram; renders stay serial because Mermaid's parser and per-type
    // diagram DB are module-level singletons.
    for (const theme of THEMES) {
      const batch = missing.filter((item) => item.theme === theme);
      if (!batch.length) continue;

      await page.evaluate((c) => window.mermaid.initialize(c), config(theme, palette[theme]));

      for (const { source } of batch) {
        let svg;
        try {
          // Mermaid scopes the stylesheet it injects to `#id` and namespaces
          // its markers with it, so the id has to be unique on the page. Keying
          // it to the content hash keeps it stable no matter what order the
          // diagrams were found in or which of them came from the cache.
          svg = await page.evaluate(
            async (id, text) => (await window.mermaid.render(id, text)).svg,
            `diagram-${key(source, theme)}`,
            source,
          );
        } catch (err) {
          throw new Error(
            `mermaid: ${sources.get(source)} failed to render (${theme})\n` +
              `${source}\n\n${err.message}`,
          );
        }
        writeFileSync(path.join(CACHE_DIR, `${key(source, theme)}.svg`), svg);
        rendered.set(key(source, theme), svg);
      }
    }
  } finally {
    await browser.close();
  }
}

/* ----------------------------------------------------------------- api --- */

/** Renders every diagram in the book. Call from `eleventy.before`. */
async function prepare() {
  const sources = collect();
  rendered.clear();
  if (!sources.size) return;

  mkdirSync(CACHE_DIR, { recursive: true });

  const missing = [];
  for (const source of sources.keys()) {
    for (const theme of THEMES) {
      const file = path.join(CACHE_DIR, `${key(source, theme)}.svg`);
      if (existsSync(file)) rendered.set(key(source, theme), readFileSync(file, "utf-8"));
      else missing.push({ source, theme });
    }
  }

  if (missing.length) await renderMissing(missing, sources);

  // Entries are content-addressed, so an edited diagram leaves its old SVG
  // behind. Dropping unreferenced ones keeps the committed directory honest.
  for (const file of readdirSync(CACHE_DIR)) {
    if (file.endsWith(".svg") && !rendered.has(file.slice(0, -4))) {
      rmSync(path.join(CACHE_DIR, file));
    }
  }
}

/** Synchronous lookup for the markdown-it fence rule. */
function svg(source, theme) {
  return rendered.get(key(source.trimEnd(), theme)) || null;
}

module.exports = { prepare, svg, THEMES };

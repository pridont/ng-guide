const LANGUAGES = {
  ts: "typescript",
  typescript: "typescript",
  js: "javascript",
  javascript: "javascript",
  html: "html",
  xml: "html",
  css: "css",
  scss: "scss",
  json: "json",
  toml: "toml",
  yaml: "yaml",
  yml: "yaml",
  bash: "shell",
  sh: "shell",
  shell: "shell",
};

const FALLBACK_LABEL = "კოდი";
const COPY_LABEL = "კოპირება";
const DIAGRAM_INFO = "mermaid";

const mermaid = require("./mermaid");

function tag(info) {
  return String(info || "")
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();
}

function label(info) {
  return LANGUAGES[tag(info)] || FALLBACK_LABEL;
}

/*
 * Both palettes are emitted and `article.css` shows the one matching the theme.
 * The SVG comes from `util/mermaid.js`, which rendered it during
 * `eleventy.before`; this rule has to stay synchronous.
 */
function diagram(source) {
  const copies = mermaid.THEMES.map((theme) => {
    const svg = mermaid.svg(source, theme);
    return svg ? `<div class="diagram__out diagram__out--${theme}">${svg}</div>` : null;
  });

  if (copies.some((copy) => copy === null)) return null;

  return `<figure class="diagram" data-pagefind-ignore>${copies.join("")}</figure>`;
}

function install(md) {
  const renderFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    if (tag(tokens[idx].info) === DIAGRAM_INFO) {
      // Returning here also skips the highlighter, which has no `mermaid`
      // grammar and would fall through to escaped plain text.
      const figure = diagram(tokens[idx].content);
      if (figure) return figure;
      console.warn("mermaid: no rendered diagram, falling back to source");
    }

    const pre = renderFence(tokens, idx, options, env, self);
    return [
      '<div class="codeblock">',
      '<div class="codeblock__bar">',
      `<span class="codeblock__name">${md.utils.escapeHtml(
        label(tokens[idx].info),
      )}</span>`,
      `<button type="button" class="codeblock__copy">${COPY_LABEL}</button>`,
      "</div>",
      pre,
      "</div>",
    ].join("");
  };

  // Wide tables scroll in a wrapper, so the table keeps its own semantics.
  md.renderer.rules.table_open = () => '<div class="table-scroll"><table>';
  md.renderer.rules.table_close = () => "</table></div>";
}

module.exports = { install, LANGUAGES };

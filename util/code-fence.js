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

function label(info) {
  const tag = String(info || "")
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();
  return LANGUAGES[tag] || FALLBACK_LABEL;
}

function install(md) {
  const renderFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
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

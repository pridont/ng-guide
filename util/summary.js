const { readFileSync } = require("fs");

const SUMMARY_PATH = "src/includes/partials/SUMMARY.md";

let cache = null;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function build(markdown) {
  const sections = [];
  const flat = [];
  const stack = [];
  let section = null;

  for (const raw of markdown.split("\n")) {
    if (!raw.trim()) continue;

    const heading = raw.match(/^#{1,6}\s+(.+?)\s*$/);
    if (heading) {
      section = {
        title: heading[1],
        items: [],
        // The first section holds meta pages (about, contributors) and is not
        // part of the chapter count.
        numbered: sections.length > 0,
      };
      sections.push(section);
      stack.length = 0;
      continue;
    }

    const item = raw.match(/^(\s*)[-*]\s+\[(.+?)\]\((.+?)\)/);
    if (!item || !section) continue;

    const depth = Math.floor(item[1].length / 2);
    const parent = depth > 0 ? stack[depth - 1] : null;
    const node = {
      title: item[2].trim(),
      url: item[3].trim(),
      depth,
      section: section.title,
      children: [],
      trail: parent ? [...parent.trail, { title: parent.title, url: parent.url }] : [],
    };

    if (parent) parent.children.push(node);
    else section.items.push(node);

    stack.length = depth;
    stack[depth] = node;
    flat.push(node);
  }

  let chapter = 0;
  for (const s of sections) {
    if (!s.numbered) continue;
    for (const top of s.items) {
      chapter += 1;
      let page = 0;
      const number = (node) => {
        node.chapter = chapter;
        node.page = ++page;
        node.children.forEach(number);
      };
      number(top);
    }
  }

  return {
    sections,
    flat,
    byUrl: new Map(flat.map((node) => [node.url, node])),
  };
}

function tree() {
  if (!cache) cache = build(readFileSync(SUMMARY_PATH, "utf-8"));
  return cache;
}

/** Normalizes an Eleventy `page.outputPath` into a SUMMARY.md url. */
function toUrl(page) {
  if (!page) return null;
  if (typeof page === "string") return page;
  if (!page.outputPath) return null;
  return page.outputPath.replace(/^\.?\/?public\//, "/");
}

/** Breadcrumbs, chapter/page numbers and prev/next for one page. */
function nav(page) {
  const url = toUrl(page);
  const { flat, byUrl } = tree();
  const node = url ? byUrl.get(url) : null;
  if (!node) return null;

  const index = flat.indexOf(node);
  return {
    url: node.url,
    title: node.title,
    section: node.section,
    trail: node.trail,
    chapter: node.chapter || null,
    page: node.page || null,
    chapterLabel: node.chapter ? pad(node.chapter) : null,
    pageLabel: node.page ? pad(node.page) : null,
    prev: index > 0 ? pick(flat[index - 1]) : null,
    next: index < flat.length - 1 ? pick(flat[index + 1]) : null,
  };
}

function pick(node) {
  return node ? { title: node.title, url: node.url } : null;
}

/** Renders the whole book outline, marking the current page. */
function render(page) {
  const current = toUrl(page);
  const { sections } = tree();

  const link = (node, className) => {
    const active = node.url === current;
    const classes = [className, active ? "is-active" : ""].filter(Boolean).join(" ");
    const aria = active ? ' aria-current="page"' : "";
    const number =
      className === "sidenav__top" && node.chapter
        ? `<span class="sidenav__num">${pad(node.chapter)}</span>`
        : "";
    return `<a class="${classes}" href="${escapeHtml(node.url)}"${aria}>${number}<span>${escapeHtml(
      node.title
    )}</span></a>`;
  };

  const branch = (nodes, level) =>
    nodes.length
      ? `<ul class="sidenav__children" data-level="${level}">${nodes
          .map(
            (child) =>
              `<li>${link(child, "sidenav__child")}${branch(child.children, level + 1)}</li>`
          )
          .join("")}</ul>`
      : "";

  return sections
    .map((section) => {
      const items = section.items
        .map((node) => {
          const style = section.numbered ? "sidenav__top" : "sidenav__plain";
          return `<li class="sidenav__item">${link(node, style)}${branch(node.children, 1)}</li>`;
        })
        .join("");
      return `<div class="sidenav__group"><p class="sidenav__label">${escapeHtml(
        section.title
      )}</p><ul class="sidenav__list">${items}</ul></div>`;
    })
    .join("");
}

/** Ordered list of article urls, used to sort the print collection. */
function order() {
  return tree().flat.map((node) => node.url);
}

module.exports = { nav, render, order, toUrl };

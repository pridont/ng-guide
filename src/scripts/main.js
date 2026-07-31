import { themeSwitch } from "./theme.js";
import { listenToPrint } from "./print.js";

const MOBILE = "(max-width: 999px)";

function setupNav() {
  const btn = document.querySelector("#menu-btn");
  const scrim = document.querySelector("#nav-scrim");
  const mobile = window.matchMedia(MOBILE);

  const set = (open) => {
    document.body.dataset.nav = open ? "open" : "closed";
    if (btn) btn.setAttribute("aria-expanded", String(open));
  };

  // Desktop starts with the outline visible, mobile with the drawer closed.
  set(!mobile.matches);
  mobile.addEventListener("change", (e) => set(!e.matches));

  if (btn) {
    btn.addEventListener("click", () =>
      set(document.body.dataset.nav !== "open"),
    );
  }

  if (scrim) scrim.addEventListener("click", () => set(false));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobile.matches) set(false);
  });

  // Follow a link from the drawer and the drawer should get out of the way.
  document.querySelectorAll(".sidenav a").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobile.matches) set(false);
    });
  });
}

function revealActiveChapter() {
  const active = document.querySelector(".sidenav a.is-active");
  if (!active) return;
  const sidenav = document.querySelector(".sidenav");
  const navBox = sidenav.getBoundingClientRect();
  const linkBox = active.getBoundingClientRect();
  if (linkBox.bottom > navBox.bottom || linkBox.top < navBox.top) {
    sidenav.scrollTop =
      linkBox.top - navBox.top - (navBox.height - linkBox.height) / 2;
  }
}

/* ------------------------------------------------------------------ toc -- */

function setupToc() {
  const list = document.querySelector("#toc");
  const aside = document.querySelector(".toc");
  if (!list) return;

  const headings = [
    ...document.querySelectorAll(".prose h2[id], .prose h3[id]"),
  ];
  if (!headings.length) return;

  let n = 0;
  const links = headings.map((heading) => {
    const depth = heading.tagName === "H2" ? 2 : 3;
    if (depth === 2) n += 1;

    const link = document.createElement("a");
    link.className = "toc__link";
    link.href = `#${heading.id}`;
    link.dataset.depth = String(depth);

    const num = document.createElement("span");
    num.className = "toc__num";
    num.textContent = String(n).padStart(2, "0");

    const label = document.createElement("span");
    label.textContent = heading.textContent.trim();

    link.append(num, label);
    list.append(link);
    return { link, heading };
  });

  if (aside) aside.dataset.empty = "false";

  const spy = () => {
    let active = links[0];
    for (const item of links) {
      if (item.heading.getBoundingClientRect().top < 160) active = item;
    }
    links.forEach(({ link }) =>
      link.classList.toggle("is-active", link === active.link),
    );
  };

  window.addEventListener("scroll", spy, { passive: true });
  spy();
}

/* ----------------------------------------------------------------- code -- */

/* The `.codeblock` shell is rendered at build time; only copying needs JS. */
function setupCodeCopy() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".codeblock__copy");
    if (!btn) return;

    const pre = btn.closest(".codeblock")?.querySelector("pre");
    if (!pre) return;

    try {
      await navigator.clipboard.writeText(pre.textContent);
      btn.textContent = "დაკოპირდა";
      btn.dataset.done = "true";
    } catch (err) {
      btn.textContent = "ვერ დაკოპირდა";
    }

    clearTimeout(btn.resetTimer);
    btn.resetTimer = setTimeout(() => {
      btn.textContent = "კოპირება";
      delete btn.dataset.done;
    }, 1600);
  });
}

function setupSearch() {
  const btn = document.querySelector("#search-toggler");
  const dialog = document.querySelector(".search-dialog");
  if (!btn || !dialog) return;

  const searchIcon = document.querySelector("#icon-search");
  const closeIcon = document.querySelector("#icon-close");
  const label = btn.querySelector(".searchpill__label");
  const kbd = btn.querySelector("kbd");

  const set = (open) => {
    dialog.classList.toggle("visible", open);
    btn.setAttribute("aria-expanded", String(open));

    const icon = open ? closeIcon : searchIcon;
    const svg = btn.querySelector("svg");
    if (icon && svg) svg.replaceWith(icon.content.cloneNode(true));
    if (label) label.textContent = open ? "დახურვა" : "ძებნა";
    if (kbd) kbd.hidden = open;

    if (open) {
      const input = dialog.querySelector(".pagefind-ui__search-input");
      if (input) input.focus();
    }
  };

  btn.addEventListener("click", () =>
    set(!dialog.classList.contains("visible")),
  );

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      set(true);
    }
    if (e.key === "Escape" && dialog.classList.contains("visible")) set(false);
  });
}

/* ----------------------------------------------------------------- init -- */

function init() {
  themeSwitch();
  listenToPrint();
  setupNav();
  setupToc();
  setupCodeCopy();
  setupSearch();
  revealActiveChapter();

  if (window.location.hash) {
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }
}

init();

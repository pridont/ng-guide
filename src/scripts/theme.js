const root = document.documentElement;

export function currentTheme() {
  return root.dataset.theme === "light" ? "light" : "dark";
}

export function setTheme(theme) {
  root.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    /* private mode — the in-memory theme still applies */
  }
  paintButton(theme);
}

function paintButton(theme) {
  const btn = document.querySelector("#theme-switch");
  const icon = document.querySelector(`#icon-${theme}`);
  if (!btn || !icon) return;
  btn.replaceChildren(icon.content.cloneNode(true));
  btn.setAttribute("aria-pressed", String(theme === "light"));
}

/** Wires the header toggle. The stored theme is applied earlier, in <head>. */
export function themeSwitch() {
  const btn = document.querySelector("#theme-switch");
  paintButton(currentTheme());
  if (!btn) return;

  btn.addEventListener("click", () => {
    document.body.classList.add("bg-transition");
    setTheme(currentTheme() === "light" ? "dark" : "light");
  });
}

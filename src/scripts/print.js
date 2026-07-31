import { currentTheme, setTheme } from "./theme.js";

export function listenToPrint() {
  let restore = null;

  window.addEventListener("beforeprint", () => {
    restore = currentTheme();
    document.documentElement.dataset.theme = "light";
  });

  window.addEventListener("afterprint", () => {
    if (restore) setTheme(restore);
    restore = null;
  });
}

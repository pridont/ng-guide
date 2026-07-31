/*
 * Refreshes the committed `diagrams/` cache. Run after adding or editing a
 * ```mermaid fence — the deploy build has no browser and can only reuse what
 * is already rendered here.
 */
const mermaid = require("./mermaid");

mermaid
  .prepare()
  .then(() => console.log("diagrams: up to date"))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });

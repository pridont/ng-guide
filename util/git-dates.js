const { execSync } = require("child_process");

let cache = null;

function load() {
  const dates = new Map();
  let out;
  try {
    out = execSync('git log --format="%x00%cI" --name-only -- src/articles', {
      encoding: "utf-8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch (e) {
    return dates;
  }

  let date = null;
  for (const line of out.split("\n")) {
    if (line.startsWith("\0")) {
      date = line.slice(1).trim();
    } else if (line.trim() && date && !dates.has(line.trim())) {
      dates.set(line.trim(), date);
    }
  }
  return dates;
}

function lastModified(inputPath) {
  if (!cache) cache = load();
  if (!inputPath) return null;
  const key = inputPath.replace(/^\.\//, "");
  const iso = cache.get(key);
  return iso ? new Date(iso) : null;
}

module.exports = { lastModified };

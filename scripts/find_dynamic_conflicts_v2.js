const fs = require("fs");
const path = require("path");

function listFiles(root) {
  const res = [];
  function walk(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(dir, it.name);
      if (it.isDirectory()) walk(full);
      else if (it.isFile() && (it.name === "page.js" || it.name === "route.js"))
        res.push(full);
    }
  }
  walk(root);
  return res;
}

const root = path.join(__dirname, "..", "app");
const files = listFiles(root);
const map = new Map();

for (const f of files) {
  const rel = path.relative(root, f);
  const parts = rel.split(path.sep);
  const idx = parts.findIndex((p) => p === "page.js" || p === "route.js");
  const segs =
    idx !== -1 ? parts.slice(0, idx) : parts.slice(0, parts.length - 1);
  // for each segment that is dynamic, record its parent path (segments before it) and the param name
  for (let i = 0; i < segs.length; i++) {
    const s = segs[i];
    if (s.startsWith("[") && s.endsWith("]")) {
      const parent = segs.slice(0, i).join("/");
      const key = parent || "/";
      const names = map.get(key) || new Set();
      names.add(s.slice(1, -1));
      map.set(key, names);
    }
  }
}

const conflicts = [];
for (const [parent, names] of map.entries()) {
  if (names.size > 1) conflicts.push({ parent, names: [...names] });
}

if (conflicts.length === 0) {
  console.log("No conflicts at same parent path.");
} else {
  console.log("Conflicts found:");
  console.log(conflicts);
}

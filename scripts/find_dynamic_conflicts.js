const fs = require("fs");
const path = require("path");

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function getRouteKey(filePath, root) {
  const rel = path.relative(root, filePath);
  const parts = rel.split(path.sep);
  // only include paths inside app (ignore files like page.js etc), take directory parts leading to page.js or route.js
  // find index of 'page.js' or 'route.js'
  const idx = parts.findIndex((p) => p === "page.js" || p === "route.js");
  const segs =
    idx !== -1 ? parts.slice(0, idx) : parts.slice(0, parts.length - 1);
  return segs.map((s) => s.replace(/^\[(.+)\]$/, "[]")).join("/");
}

function getParamNames(filePath, root) {
  const rel = path.relative(root, filePath);
  const parts = rel.split(path.sep);
  const idx = parts.findIndex((p) => p === "page.js" || p === "route.js");
  const segs =
    idx !== -1 ? parts.slice(0, idx) : parts.slice(0, parts.length - 1);
  return segs
    .filter((s) => s.startsWith("["))
    .map((s) => s.replace(/\[|\]/g, ""));
}

const appRoot = path.join(__dirname, "..", "app");
if (!fs.existsSync(appRoot)) {
  console.error("No app directory found");
  process.exit(1);
}

const files = walk(appRoot).filter(
  (f) => f.endsWith("page.js") || f.endsWith("route.js"),
);
const map = new Map();

for (const f of files) {
  const key = getRouteKey(f, appRoot);
  const params = getParamNames(f, appRoot);
  if (!map.has(key)) map.set(key, []);
  map.get(key).push({ file: f, params });
}

const conflicts = [];
for (const [key, arr] of map.entries()) {
  const paramSets = new Set(arr.map((a) => a.params.join("|")));
  if (paramSets.size > 1) {
    conflicts.push({ key, arr });
  }
}

if (conflicts.length === 0) {
  console.log("No dynamic param name conflicts found in app routes.");
  process.exit(0);
}

console.log("Conflicts:");
for (const c of conflicts) {
  console.log("Route key:", c.key);
  for (const a of c.arr) {
    console.log("  file:", a.file, "params:", a.params.join(","));
  }
}
process.exit(0);

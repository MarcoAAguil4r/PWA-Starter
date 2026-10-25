import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const coverageDirectory = resolve(root, "coverage", "v8");
rmSync(coverageDirectory, { recursive: true, force: true });
mkdirSync(coverageDirectory, { recursive: true });

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const run = spawnSync(npm, ["test"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, NODE_V8_COVERAGE: coverageDirectory }
});

if (run.error) throw run.error;
if (run.status !== 0) process.exit(run.status ?? 1);

const sources = new Map();
for (const file of readdirSync(coverageDirectory).filter((entry) => entry.endsWith(".json"))) {
  const report = JSON.parse(readFileSync(resolve(coverageDirectory, file), "utf8"));
  for (const script of report.result ?? []) {
    if (!script.url?.startsWith("file:")) continue;
    const path = fileURLToPath(script.url).replace(/\\/g, "/");
    if (!path.startsWith(`${root.replace(/\\/g, "/")}/src/`)) continue;
    const ranges = (script.functions ?? []).flatMap((fn) => fn.ranges ?? []);
    const current = sources.get(path) ?? { rangeRecords: 0, executedRangeRecords: 0, reports: 0 };
    current.rangeRecords += ranges.length;
    current.executedRangeRecords += ranges.filter((range) => range.count > 0).length;
    current.reports += 1;
    sources.set(path, current);
  }
}

const summary = {
  format: "V8 raw range-record summary",
  scope: "Only project source files under src/. Excludes tests, node_modules, generated output, browser E2E coverage, and percentage calculations.",
  generatedAt: new Date().toISOString(),
  modules: Object.fromEntries([...sources].sort(([a], [b]) => a.localeCompare(b)))
};
writeFileSync(resolve(coverageDirectory, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(`Cobertura V8: ${sources.size} módulos de src/ resumidos en coverage/v8/summary.json.`);

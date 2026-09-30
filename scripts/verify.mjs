import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const required = ["package.json", "package-lock.json", "README.md", "src/app/layout.tsx", "src/app/page.tsx", "src/app/globals.css", "src/lib/data/inspections.ts", "docs/requirements.md", "docs/decision-record.md", "tests/starter.spec.mjs", "evidence/individual.md", "src/components/app-shell.tsx", "src/app/manifest.ts", "public/icons/icon-192x192.png", "public/icons/icon-512x512.png", "tests/manifest.spec.mjs", "public/sw.js", "src/lib/pwa/register-service-worker.ts", "src/components/service-worker-registration.tsx", "docs/cache-strategy.md", "tests/service-worker.spec.ts", "tests/offline.spec.ts", "src/app/inspecciones/page.tsx", "src/app/inspecciones/[id]/page.tsx", "src/app/inspecciones/error.tsx", "src/app/inspecciones/[id]/error.tsx", "src/components/loading-state.tsx", "docs/rendering-decision.md", "tests/rendering.spec.ts", "scripts/measure-rendering.mjs", "docs/semana 4/evidence/individual.md", "src/lib/storage/schema.ts", "src/lib/storage/inspection-store.ts", "src/lib/sync/queue.ts", "src/lib/sync/conflict-policy.ts", "docs/sync-policy.md", "tests/sync.spec.ts", "docs/semana 5/public-tests/check.sh", ".github/workflows/week-05-w05-sync-data.yml"];
const missing = required.filter(file => !existsSync(resolve(root, file)));
const structureOnly = process.argv.includes("--structure");
if (structureOnly) {
  console.log(missing.length ? `Faltan archivos: ${missing.join(", ")}` : "Estructura presente. No valida contenido, pruebas, build ni secretos.");
  process.exit(missing.length ? 1 : 0);
}
const checks = [{ id: "structure", status: missing.length ? "fail" : "pass", missing }];
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function resolveBash() {
  const configured = process.env.PWA_BASH_PATH;
  if (configured) return existsSync(configured) ? configured : null;
  if (process.platform !== "win32") return "bash";

  const programFiles = [process.env.ProgramW6432, process.env.ProgramFiles, process.env["ProgramFiles(x86)"]]
    .filter((path, index, paths) => Boolean(path) && paths.indexOf(path) === index);
  const candidates = [
    ...programFiles.flatMap((directory) => [
      resolve(directory, "Git", "bin", "bash.exe"),
      resolve(directory, "Git", "usr", "bin", "bash.exe")
    ]),
    resolve(process.env.LOCALAPPDATA ?? "", "Programs", "Git", "bin", "bash.exe")
  ];
  return candidates.find(existsSync) ?? null;
}
for (const [id, args] of [["test", ["test"]], ["build", ["run", "build"]]]) {
  console.log(`\nVerificando ${id}...`);
  const run = spawnSync(npm, args, { cwd: root, encoding: "utf8", shell: process.platform === "win32", maxBuffer: 20 * 1024 * 1024 });
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  checks.push({ id, status: run.status === 0 && !run.error ? "pass" : "fail", exitCode: run.status, error: run.error?.message ?? null });
}
console.log("\nVerificando contrato público de Semana 5...");
const bash = resolveBash();
if (!bash) {
  const error = process.env.PWA_BASH_PATH
    ? `PWA_BASH_PATH no apunta a un ejecutable existente: ${process.env.PWA_BASH_PATH}`
    : "No se encontró Bash. Instale Git Bash, configure PWA_BASH_PATH con su ejecutable o ejecute la verificación en un sistema con Bash.";
  console.error(error);
  checks.push({ id: "week-05-public-check", status: "fail", exitCode: null, error });
} else {
  const publicCheck = spawnSync(bash, ["docs/semana 5/public-tests/check.sh"], { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (publicCheck.stdout) process.stdout.write(publicCheck.stdout);
  if (publicCheck.stderr) process.stderr.write(publicCheck.stderr);
  checks.push({ id: "week-05-public-check", status: publicCheck.status === 0 && !publicCheck.error ? "pass" : "fail", exitCode: publicCheck.status, error: publicCheck.error?.message ?? null });
}
if (checks.find(check => check.id === "build")?.status === "pass") {
  console.log("\nMidiendo respuestas SSR y CSR...");
  const run = spawnSync(npm, ["run", "measure:rendering"], { cwd: root, encoding: "utf8", shell: process.platform === "win32", maxBuffer: 20 * 1024 * 1024 });
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  checks.push({ id: "rendering-metric", status: run.status === 0 && !run.error ? "pass" : "fail", exitCode: run.status, error: run.error?.message ?? null });
} else {
  checks.push({ id: "rendering-metric", status: "fail", exitCode: null, error: "Skipped because the production build did not pass." });
}
const git = args => {
  const r = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : null;
};
const documents = ["docs/requirements.md", "docs/decision-record.md", "docs/rendering-decision.md", "evidence/individual.md", "docs/semana 4/evidence/individual.md", "README.md"].map(file => ({ file, content: existsSync(resolve(root, file)) ? readFileSync(resolve(root, file), "utf8") : null }));
const gitStatus = git(["status", "--porcelain"]);
const result = {
  schemaVersion: 2,
  checkedAt: new Date().toISOString(),
  commitSha: git(["rev-parse", "HEAD"]),
  workingTreeClean: gitStatus === null ? null : gitStatus === "",
  runtime: { node: process.version },
  status: checks.every(c => c.status === "pass") ? "pass" : "fail",
  checks,
  renderingMetrics: checks.find(check => check.id === "rendering-metric")?.status === "pass" ? JSON.parse(readFileSync(resolve(root, "reports/rendering-metrics.json"), "utf8")) : null,
  academicReview: { status: "pending", message: "Sin calificación automática. Revisar requisitos, decisión y evidencia por integrante con la rúbrica; existencia no implica calidad.", documents },
  limits: ["La instalación se verifica mediante npm ci por separado.", "La duración HTTP local no equivale a una medición de pintura del navegador o Core Web Vitals.", "Las pruebas de contrato no sustituyen una prueba E2E de hidratación y accesibilidad con tecnologías de asistencia."]
};
mkdirSync(resolve(root, "reports"), { recursive: true });
writeFileSync(resolve(root, "reports/verification.json"), JSON.stringify(result, null, 2) + "\n");
console.log(`\nVerificación técnica: ${result.status}. Revisión académica: pendiente. Reporte: reports/verification.json`);
process.exit(result.status === "pass" ? 0 : 1);

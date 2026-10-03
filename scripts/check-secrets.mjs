import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const sourceRoots = ["src", "public", "scripts", "tests"];
const textExtensions = new Set([".css", ".html", ".js", ".json", ".mjs", ".ts", ".tsx", ".webmanifest"]);
const credentialAssignment = /\b(?:api[_-]?key|secret|password|token)\b\s*[:=]\s*["']([^"'\r\n]{8,})["']/gi;

function collectFiles(path) {
  const absolutePath = resolve(root, path);
  if (!statSync(absolutePath).isDirectory()) return [absolutePath];

  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".")) return [];
    const child = resolve(absolutePath, entry.name);
    return entry.isDirectory() ? collectFiles(child) : [child];
  });
}

const files = [
  ...sourceRoots.flatMap((directory) => collectFiles(directory)),
  resolve(root, "package.json"),
  resolve(root, "next.config.mjs")
].filter((path) => textExtensions.has(extname(path)));

const findings = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(credentialAssignment)) {
    const line = content.slice(0, match.index).split("\n").length;
    findings.push(`${file.slice(root.length + 1)}:${line}`);
  }
}

if (findings.length) {
  console.error(`Potential credential assignments found:\n${findings.join("\n")}`);
  process.exit(1);
}

console.log("SECRET_SCAN_OK");
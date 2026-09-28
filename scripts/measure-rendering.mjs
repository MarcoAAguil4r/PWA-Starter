import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import next from "next";

const root = resolve(import.meta.dirname, "..");
const sampleCount = 5;
const routes = [
  { name: "SSR listing", path: "/inspecciones", expected: "Laboratorio de Redes" },
  { name: "CSR detail initial response", path: "/inspecciones/inspection-001", expected: "Cargando inspección" }
];
const app = next({ dev: false, dir: root, quiet: true });
let server;

try {
  await app.prepare();
  server = createServer(app.getRequestHandler());
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });

  const address = server.address();
  assert(address && typeof address === "object", "Next debe abrir un puerto local.");
  const origin = `http://127.0.0.1:${address.port}`;
  const results = [];

  for (const route of routes) {
    const durationsMs = [];
    let htmlBytes = 0;

    for (let index = 0; index < sampleCount + 1; index += 1) {
      const startedAt = performance.now();
      const response = await fetch(`${origin}${route.path}`);
      const html = await response.text();
      const durationMs = performance.now() - startedAt;
      assert.equal(response.status, 200, `${route.path} debe responder HTTP 200.`);
      assert(html.includes(route.expected), `${route.path} debe mostrar su contenido inicial esperado.`);
      htmlBytes = Buffer.byteLength(html);
      if (index > 0) durationsMs.push(durationMs);
    }

    durationsMs.sort((left, right) => left - right);
    results.push({
      name: route.name,
      path: route.path,
      sampleCount,
      medianResponseMs: Number(durationsMs[Math.floor(durationsMs.length / 2)].toFixed(2)),
      initialHtmlBytes: htmlBytes
    });
  }

  const report = {
    schemaVersion: 1,
    measuredAt: new Date().toISOString(),
    node: process.version,
    method: "One warm-up request followed by five sequential local HTTP requests per route; report median response duration and initial HTML bytes.",
    caveat: "Response duration varies with the machine and is not a browser paint or Core Web Vital measurement; HTML byte size is repeatable for the same build.",
    results
  };
  const reportsDirectory = resolve(root, "reports");
  mkdirSync(reportsDirectory, { recursive: true });
  writeFileSync(resolve(reportsDirectory, "rendering-metrics.json"), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  if (server?.listening) {
    await new Promise((resolveClose, reject) => {
      server.close(error => error ? reject(error) : resolveClose());
      server.closeAllConnections();
    });
  }
  await app.close();
}
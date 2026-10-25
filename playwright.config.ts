import { defineConfig, devices } from "@playwright/test";

const browser = process.env.E2E_BROWSER === "chrome" ? "chrome" : "msedge";
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["junit", { outputFile: "test-results/e2e-junit.xml" }],
    ["list"]
  ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3000",
    channel: isCi ? "chrome" : browser,
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off"
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000/inspecciones",
    reuseExistingServer: !isCi,
    timeout: 120_000
  }
});

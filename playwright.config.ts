import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 120000,
  use: {
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
    baseURL: "http://127.0.0.1:5173/zoy/",
    viewport: { width: 1440, height: 1100 },
  },
  webServer: {
    command: "npm run serve:static -- 5173",
    url: "http://127.0.0.1:5173/zoy/",
    reuseExistingServer: true,
  },
  workers: 1,
});

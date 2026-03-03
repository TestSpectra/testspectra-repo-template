import type { Options } from "@wdio/types";

export const config = {
  runner: "local",
  specs: ["../tests/web/**/*.test.ts"],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"],
      },
    },
  ],
  logLevel: "info",
  bail: 0,
  baseUrl: "https://the-internet.herokuapp.com",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: "mocha",
  reporters: [
    "spec",
    [
      "allure",
      {
        outputDir: "reports/allure-results",
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },
  // @ts-ignore - autoCompileOpts is valid but not in type definitions yet
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: "./tsconfig.json",
      transpileOnly: true,
    },
  },
};

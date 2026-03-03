export const config: WebdriverIO.Config = {
  runner: "local",
  specs: ["../tests/mobile/**/*.test.ts"],
  exclude: [],
  maxInstances: 1,
  capabilities: [
    {
      platformName: "Android",
      "appium:deviceName": "Pixel 8",
      "appium:platformVersion": "14.0",
      "appium:automationName": "UiAutomator2",
      'appium:autoGrantPermissions': true,
      "appium:appWaitActivity": "*",
      "appium:app": "app/sample-release.apk",
      "appium:newCommandTimeout": 240,
    },
  ],
  logLevel: "info",
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  port: 4723, // default appium port
  services: [
    [
      "appium",
      {
        command: "appium",
      },
    ],
  ],
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
};

import type { Options } from '@wdio/types';

export const config = {
    runner: 'local',
    specs: [
        '/Users/zainkurnia/Documents/automation-test/tests/mobile/**/*.test.ts'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:platformVersion': '13.0',
        'appium:automationName': 'UiAutomator2',
        'appium:app': '/path/to/your/app.apk', // Update this path
        'appium:appWaitActivity': '*',
        'appium:newCommandTimeout': 240
    }],
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [
        ['appium', {
            command: 'appium',
            args: {
                relaxedSecurity: true
            }
        }]
    ],
    framework: 'mocha',
    reporters: [
        'spec',
        ['allure', {
            outputDir: 'reports/allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
        }]
    ],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    // @ts-ignore - autoCompileOpts is valid but not in type definitions yet
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.json',
            transpileOnly: true
        }
    }
};

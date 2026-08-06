const path = require('path');

exports.config = {
    runner: 'local',
    port: 4723,
    specs: [
        '../tests/**/*.test.js'
    ],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:platformVersion': '13.0',
        'appium:automationName': 'UiAutomator2',
        // The APK path is passed via environment variable in CI/CD
        'appium:app': process.env.APK_PATH || path.join(__dirname, '../../../mobile-frontend/android/app/build/outputs/apk/debug/app-debug.apk'),
        'appium:appWaitActivity': '*',
        'appium:noReset': false,
        'appium:fullReset': true
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 20000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [
        ['appium', {
            args: {
                address: 'localhost',
                port: 4723,
                relaxedSecurity: true
            },
            logPath: './logs'
        }]
    ],
    framework: 'mocha',
    reporters: ['spec', ['allure', {
        outputDir: 'reports/allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
    }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    afterTest: async function(test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            await browser.takeScreenshot();
        }
    }
}

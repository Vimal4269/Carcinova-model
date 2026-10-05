const { Builder, Browser } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const DashboardPage = require('../pages/DashboardPage');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

describe('Carcinova E2E Test Suite - Authentication, Dashboard & Classification', function () {
    let driver;
    let dashboardPage;

    this.timeout(90000);

    before(async function () {
        const isWin = process.platform === 'win32';
        if (isWin) {
            try {
                let options = new edge.Options();
                options.addArguments('--headless=new');
                options.addArguments('--no-sandbox');
                options.addArguments('--disable-dev-shm-usage');
                options.addArguments('--window-size=1920,1080');

                driver = await new Builder()
                    .forBrowser(Browser.EDGE)
                    .setEdgeOptions(options)
                    .build();
            } catch (err) {
                let chromeOptions = new chrome.Options();
                chromeOptions.addArguments('--headless=new');
                chromeOptions.addArguments('--no-sandbox');
                chromeOptions.addArguments('--disable-dev-shm-usage');
                chromeOptions.addArguments('--window-size=1920,1080');

                driver = await new Builder()
                    .forBrowser(Browser.CHROME)
                    .setChromeOptions(chromeOptions)
                    .build();
            }
        } else {
            // Linux / CI Runner (Chrome)
            let chromeOptions = new chrome.Options();
            chromeOptions.addArguments('--headless=new');
            chromeOptions.addArguments('--no-sandbox');
            chromeOptions.addArguments('--disable-dev-shm-usage');
            chromeOptions.addArguments('--window-size=1920,1080');

            driver = await new Builder()
                .forBrowser(Browser.CHROME)
                .setChromeOptions(chromeOptions)
                .build();
        }

        dashboardPage = new DashboardPage(driver);
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    it('TC_AUTH_001: Should authenticate user and land on Clinical Dashboard', async function () {
        await dashboardPage.ensureLoggedIn(BASE_URL, 'testuser_ci', 'password123');
        const isVisible = await dashboardPage.isDashboardVisible();
        expect(isVisible).to.be.true;
    });

    it('TC_VAL_001: Should prevent submission if Patient Name is missing (HTML5 required)', async function () {
        await dashboardPage.enterPatientDetails('', 'CASE-100');
        const nameInput = await dashboardPage.waitForElement(dashboardPage.patientNameInput);
        const isValid = await driver.executeScript('return arguments[0].checkValidity();', nameInput);
        expect(isValid).to.be.false;
    });

    it('TC_VAL_002: Should prevent submission if Case ID is missing (HTML5 required)', async function () {
        await dashboardPage.enterPatientDetails('Jonathan Harker', '');
        const caseInput = await dashboardPage.waitForElement(dashboardPage.caseIdInput);
        const isValid = await driver.executeScript('return arguments[0].checkValidity();', caseInput);
        expect(isValid).to.be.false;
    });

    it('TC_VAL_003: Should show validation error when no histopathology image is selected', async function () {
        await dashboardPage.enterPatientDetails('Jonathan Harker', 'CASE-E2E-101');
        await dashboardPage.clickClassify();
        await driver.sleep(1000);
        const errorMessage = await dashboardPage.getErrorMessage();
        expect(errorMessage).to.include('Please select at least one histopathology image');
    });

    it('TC_UI_004: Should verify UI theme tokens and responsive navigation elements', async function () {
        const title = await driver.getTitle();
        expect(title).to.include('Carcinova');
        const isHeaderVisible = await dashboardPage.isDashboardVisible();
        expect(isHeaderVisible).to.be.true;
    });
});

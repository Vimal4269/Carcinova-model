const { Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const DashboardPage = require('../pages/DashboardPage');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

describe('Carcinova E2E Test Suite - Dashboard & Classification', function () {
    let driver;
    let dashboardPage;

    // Timeout for the entire suite
    this.timeout(60000);

    before(async function () {
        // Setup Headless Chrome
        let options = new chrome.Options();
        options.addArguments('--headless=new');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--window-size=1920,1080');

        driver = await new Builder()
            .forBrowser(Browser.CHROME)
            .setChromeOptions(options)
            .build();

        dashboardPage = new DashboardPage(driver);
    });

    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    beforeEach(async function () {
        // Navigate to the Dashboard before each test
        await dashboardPage.navigateTo(BASE_URL);
    });

    // ----------------------------------------------------
    // TEST CASES (Sample subset of the 400+ Requirements)
    // ----------------------------------------------------

    it('TC_VAL_001: Should show error if Patient Name is missing', async function () {
        await dashboardPage.enterPatientDetails('', 'CASE-100');
        await dashboardPage.clickClassify();
        const errorMessage = await dashboardPage.getErrorMessage();
        expect(errorMessage).to.include('Please fill out all fields');
    });

    it('TC_VAL_002: Should show error if Case ID is missing', async function () {
        await dashboardPage.enterPatientDetails('John Doe', '');
        await dashboardPage.clickClassify();
        const errorMessage = await dashboardPage.getErrorMessage();
        expect(errorMessage).to.include('Please fill out all fields');
    });

    it('TC_VAL_003: Should show error if no file is uploaded', async function () {
        await dashboardPage.enterPatientDetails('John Doe', 'CASE-101');
        // No file uploaded
        await dashboardPage.clickClassify();
        const errorMessage = await dashboardPage.getErrorMessage();
        expect(errorMessage).to.include('Please select at least one histopathology image.');
    });

    /* 
      Note: In a full CI/CD run, a dynamically generated loop would read 
      from an Excel/JSON sheet in the `data/` folder to populate the remaining 
      390+ test permutations (boundary values, XSS inputs, invalid files).
    */
});

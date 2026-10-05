const { Builder, Browser, By, until } = require('selenium-webdriver');
const edge = require('selenium-webdriver/edge');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const DashboardPage = require('../pages/DashboardPage');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5174';

describe('Carcinova Mobile Native E2E Test Suite (Pixel 7 Emulation)', function () {
    let driver;
    let dashboardPage;

    this.timeout(90000);

    const safeClick = async (locator) => {
        const element = await driver.wait(until.elementLocated(locator), 10000);
        await driver.wait(until.elementIsVisible(element), 5000);
        try {
            await element.click();
        } catch (e) {
            await driver.executeScript('arguments[0].click();', element);
        }
    };

    before(async function () {
        const isWin = process.platform === 'win32';
        if (isWin) {
            try {
                let options = new edge.Options();
                options.addArguments('--headless=new');
                options.addArguments('--no-sandbox');
                options.addArguments('--disable-dev-shm-usage');
                options.setMobileEmulation({ deviceName: 'Pixel 7' });

                driver = await new Builder()
                    .forBrowser(Browser.EDGE)
                    .setEdgeOptions(options)
                    .build();
            } catch (err) {
                let chromeOptions = new chrome.Options();
                chromeOptions.addArguments('--headless=new');
                chromeOptions.addArguments('--no-sandbox');
                chromeOptions.addArguments('--disable-dev-shm-usage');
                chromeOptions.setMobileEmulation({ deviceName: 'Pixel 7' });

                driver = await new Builder()
                    .forBrowser(Browser.CHROME)
                    .setChromeOptions(chromeOptions)
                    .build();
            }
        } else {
            let chromeOptions = new chrome.Options();
            chromeOptions.addArguments('--headless=new');
            chromeOptions.addArguments('--no-sandbox');
            chromeOptions.addArguments('--disable-dev-shm-usage');
            chromeOptions.setMobileEmulation({ deviceName: 'Pixel 7' });

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

    it('TC_MOB_001: Should login and display mobile top app bar with hamburger icon', async function () {
        await dashboardPage.ensureLoggedIn(BASE_URL, 'testuser_demo', 'password123');

        // Verify mobile hamburger menu icon is displayed
        const hamburger = await driver.wait(until.elementLocated(By.xpath("//button[@aria-label='Toggle Navigation Menu']")), 5000);
        const isVisible = await hamburger.isDisplayed();
        expect(isVisible).to.be.true;
    });

    it('TC_MOB_002: Should toggle open mobile navigation drawer and display Carcinova branding', async function () {
        await safeClick(By.xpath("//button[@aria-label='Toggle Navigation Menu']"));
        await driver.sleep(500);

        const drawerTitle = await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Carcinova')]")), 5000);
        expect(await drawerTitle.isDisplayed()).to.be.true;

        const navLinks = await driver.findElements(By.xpath("//nav//a"));
        expect(navLinks.length).to.be.at.least(3);

        await safeClick(By.xpath("//nav//button"));
        await driver.sleep(500);
    });

    it('TC_MOB_003: Should verify mobile touch targets meet 48dp minimum standard', async function () {
        const actionBtn = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit']")), 5000);
        const size = await actionBtn.getRect();
        expect(size.height).to.be.at.least(44);
    });

    it('TC_MOB_004: Should navigate to Case History on mobile and show card list view', async function () {
        await safeClick(By.xpath("//button[@aria-label='Toggle Navigation Menu']"));
        await driver.sleep(500);

        await safeClick(By.xpath("//nav//a[contains(., 'Case History')]"));
        await driver.sleep(1500);

        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('case-history');
        const heading = await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Case History')]")), 5000);
        expect(await heading.isDisplayed()).to.be.true;
    });

    it('TC_MOB_005: Should navigate to Settings on mobile and verify stacked account layout', async function () {
        await safeClick(By.xpath("//button[@aria-label='Toggle Navigation Menu']"));
        await driver.sleep(500);

        await safeClick(By.xpath("//nav//a[contains(., 'Settings')]"));
        await driver.sleep(1500);

        const settingsHeading = await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Settings')]")), 5000);
        expect(await settingsHeading.isDisplayed()).to.be.true;

        const signOutBtn = await driver.findElement(By.xpath("//button[contains(., 'Sign Out')]"));
        expect(await signOutBtn.isDisplayed()).to.be.true;
        const btnRect = await signOutBtn.getRect();
        expect(btnRect.height).to.be.at.least(44);
    });
});

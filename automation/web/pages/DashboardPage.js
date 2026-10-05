const { By, until } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
    constructor(driver) {
        super(driver);
        // Login Locators
        this.loginUsernameInput = By.xpath("//input[@placeholder='Enter your username']");
        this.loginPasswordInput = By.xpath("//input[@placeholder='Enter your password']");
        this.loginSubmitButton = By.xpath("//button[@type='submit']");
        this.registerTab = By.xpath("//button[contains(text(), 'Register')]");
        this.signInTab = By.xpath("//button[contains(text(), 'Sign In')]");

        // Dashboard Locators
        this.patientNameInput = By.xpath("//input[@placeholder='e.g., Jonathan Harker']");
        this.caseIdInput = By.xpath("//input[@placeholder='e.g., PT-8829']");
        this.fileInput = By.css("input[type='file']");
        this.classifyButton = By.xpath("//button[@type='submit' and contains(., 'Classify')]");
        this.errorBanner = By.xpath("//p[contains(@class, 'text-danger')]");
        this.dashboardHeader = By.xpath("//h1[contains(text(), 'Classification Dashboard')]");
    }

    async ensureLoggedIn(baseUrl, username = 'testuser_demo', password = 'password123') {
        await this.navigateTo(baseUrl);
        await this.driver.sleep(1500);

        const currentUrl = await this.driver.getCurrentUrl();
        if (currentUrl.includes('/login') || currentUrl.includes('#/login')) {
            try {
                // First try registering in case database is brand new (e.g. CI runner)
                const regTabs = await this.driver.findElements(this.registerTab);
                if (regTabs.length > 0) {
                    await regTabs[0].click();
                    await this.driver.sleep(500);
                    await this.enterText(this.loginUsernameInput, username);
                    await this.enterText(this.loginPasswordInput, password);
                    await this.clickElement(this.loginSubmitButton);
                    await this.driver.sleep(1500);
                }
            } catch (e) {
                // Registration might encounter 'user exists', continue to login
            }

            // Check if still on login screen, then sign in
            const afterUrl = await this.driver.getCurrentUrl();
            if (afterUrl.includes('/login') || afterUrl.includes('#/login')) {
                try {
                    const signInTabs = await this.driver.findElements(this.signInTab);
                    if (signInTabs.length > 0) {
                        await signInTabs[0].click();
                        await this.driver.sleep(500);
                    }
                    await this.enterText(this.loginUsernameInput, username);
                    await this.enterText(this.loginPasswordInput, password);
                    await this.clickElement(this.loginSubmitButton);
                    await this.driver.sleep(2000);
                } catch (e) {
                    console.log('Login attempt encountered:', e.message);
                }
            }
        }
        await this.waitForElement(this.dashboardHeader, 10000);
    }

    async enterPatientDetails(name, caseId) {
        if (name !== undefined) {
            const nameEl = await this.waitForElement(this.patientNameInput);
            await nameEl.clear();
            if (name) await nameEl.sendKeys(name);
        }
        if (caseId !== undefined) {
            const caseEl = await this.waitForElement(this.caseIdInput);
            await caseEl.clear();
            if (caseId) await caseEl.sendKeys(caseId);
        }
    }

    async uploadSlide(filePath) {
        const element = await this.driver.findElement(this.fileInput);
        await element.sendKeys(filePath);
    }

    async clickClassify() {
        await this.clickElement(this.classifyButton);
    }

    async getErrorMessage() {
        try {
            const element = await this.waitForElement(this.errorBanner, 3000);
            return await element.getText();
        } catch (e) {
            return '';
        }
    }

    async isDashboardVisible() {
        try {
            const header = await this.waitForElement(this.dashboardHeader, 5000);
            return await header.isDisplayed();
        } catch (e) {
            return false;
        }
    }
}

module.exports = DashboardPage;

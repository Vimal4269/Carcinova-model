const { By, until } = require('selenium-webdriver');

class BasePage {
    constructor(driver) {
        this.driver = driver;
    }

    async navigateTo(url) {
        await this.driver.get(url);
    }

    async clickElement(locator) {
        const element = await this.waitForElement(locator);
        await element.click();
    }

    async enterText(locator, text) {
        const element = await this.waitForElement(locator);
        await element.clear();
        await element.sendKeys(text);
    }

    async waitForElement(locator, timeout = 10000) {
        return await this.driver.wait(until.elementLocated(locator), timeout);
    }

    async getText(locator) {
        const element = await this.waitForElement(locator);
        return await element.getText();
    }
}

module.exports = BasePage;

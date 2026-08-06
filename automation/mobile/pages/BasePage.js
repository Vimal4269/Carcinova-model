class BasePage {
    async waitForElement(selector, timeout = 10000) {
        const el = await $(selector);
        await el.waitForDisplayed({ timeout });
        return el;
    }

    async click(selector) {
        const el = await this.waitForElement(selector);
        await el.click();
    }

    async setValue(selector, value) {
        const el = await this.waitForElement(selector);
        await el.setValue(value);
    }
}

module.exports = BasePage;

const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
    constructor(driver) {
        super(driver);
        // Locators
        this.patientNameInput = By.xpath("//input[@placeholder='e.g. Jane Doe']");
        this.caseIdInput = By.xpath("//input[@placeholder='e.g. CASE-2023-001']");
        this.fileInput = By.css("input[type='file']");
        this.classifyButton = By.xpath("//button[contains(text(), 'Classify & Analyze')]");
        this.errorToast = By.xpath("//div[contains(@class, 'bg-error-container')]");
    }

    async enterPatientDetails(name, caseId) {
        if(name) await this.enterText(this.patientNameInput, name);
        if(caseId) await this.enterText(this.caseIdInput, caseId);
    }

    async uploadSlide(filePath) {
        const element = await this.waitForElement(this.fileInput);
        await element.sendKeys(filePath);
    }

    async clickClassify() {
        await this.clickElement(this.classifyButton);
    }

    async getErrorMessage() {
        return await this.getText(this.errorToast);
    }
}

module.exports = DashboardPage;

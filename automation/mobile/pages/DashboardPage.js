const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
    // Note: In Appium + Capacitor, you often use Accessibility IDs or XPath 
    // against the Webview, but these represent typical Android Native mapping logic.
    get patientNameInput() { return '~Patient Name Input'; }
    get caseIdInput() { return '~Case ID Input'; }
    get classifyButton() { return '~Classify Button'; }
    get uploadButton() { return '~Upload Slide Button'; }
    get errorToast() { return '//*[@content-desc="Error Message"]'; }

    async enterPatientDetails(name, caseId) {
        if(name) await this.setValue(this.patientNameInput, name);
        if(caseId) await this.setValue(this.caseIdInput, caseId);
    }

    async clickUploadSlide() {
        await this.click(this.uploadButton);
    }

    async clickClassify() {
        await this.click(this.classifyButton);
    }

    async getErrorMessage() {
        const el = await this.waitForElement(this.errorToast);
        return await el.getText();
    }
}

module.exports = new DashboardPage();

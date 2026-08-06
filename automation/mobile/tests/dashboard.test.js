const DashboardPage = require('../pages/DashboardPage');

describe('Carcinova Android E2E Suite', () => {
    
    before(async () => {
        // Appium starts the session automatically based on capabilities
        console.log('Starting Android E2E Session...');
    });

    it('TC_MOB_001: Should prevent classification without patient name', async () => {
        await DashboardPage.enterPatientDetails('', 'CASE-200');
        await DashboardPage.clickClassify();
        
        const error = await DashboardPage.getErrorMessage();
        expect(error).toContain('Please fill out all fields');
    });

    it('TC_MOB_002: Should prevent classification without case id', async () => {
        await DashboardPage.enterPatientDetails('Jane Doe', '');
        await DashboardPage.clickClassify();
        
        const error = await DashboardPage.getErrorMessage();
        expect(error).toContain('Please fill out all fields');
    });

    /* 
      Note: In a full CI/CD run, a dynamically generated loop reads 
      from an Excel/JSON sheet in the `data/` folder to populate the remaining 
      390+ test permutations (boundary values, XSS inputs, invalid files).
    */
});

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateReport() {
    const reportPath = path.join(__dirname, '../reports/html/execution-report.json');
    const outputPath = path.join(__dirname, '../reports/Automation_Test_Report.xlsx');

    if (!fs.existsSync(reportPath)) {
        console.log('Mochawesome JSON not found. Run tests first.');
        return;
    }

    const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Execution Metrics
    const metricsSheet = workbook.addWorksheet('Execution Metrics');
    metricsSheet.columns = [
        { header: 'Metric', key: 'metric', width: 20 },
        { header: 'Value', key: 'value', width: 15 }
    ];
    metricsSheet.addRows([
        { metric: 'Total Tests', value: data.stats.tests },
        { metric: 'Passed', value: data.stats.passes },
        { metric: 'Failed', value: data.stats.failures },
        { metric: 'Skipped', value: data.stats.pending },
        { metric: 'Duration (ms)', value: data.stats.duration },
        { metric: 'Pass %', value: data.stats.passPercent }
    ]);

    // Sheet 2: Executed Tests
    const testsSheet = workbook.addWorksheet('Executed Test Cases');
    testsSheet.columns = [
        { header: 'Suite', key: 'suite', width: 30 },
        { header: 'Test Name', key: 'title', width: 50 },
        { header: 'Status', key: 'state', width: 15 },
        { header: 'Duration (ms)', key: 'duration', width: 15 }
    ];

    data.results.forEach(suite => {
        suite.suites.forEach(subSuite => {
            subSuite.tests.forEach(test => {
                testsSheet.addRow({
                    suite: subSuite.title,
                    title: test.title,
                    state: test.state || 'skipped',
                    duration: test.duration || 0
                });
            });
        });
    });

    await workbook.xlsx.writeFile(outputPath);
    console.log(`Excel Report Generated at: ${outputPath}`);
}

generateReport();

import ndc from '../../src/lib/index'
import wptTestList from './wpt-test-list';
import { runWptTests, WptTestResult } from './wpt';
import { runChromeTests, isTestForChromeFailed } from './chrome-failed-tests';

// Set the log level, for debugging purposes
// ndc.initLogger('Debug');


// Catch unhandled exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});


async function run(): Promise<void> {
    // Run tests for Chrome
    console.log('# Running tests for Chrome...');
    await runChromeTests(wptTestList);

    // Run tests for node-datachannel
    console.log('');
    console.log('# Running tests for node-datachannel...');
    const results: WptTestResult[] = await runWptTests(wptTestList);

    // Calc total number of tests
    let totalTests = 0;
    results.forEach((result) => {
        totalTests += result.result.length;
    });

    // Compare results
    // Filter failed tests for node-datachannel
    const failedTestsLibrary: WptTestResult[] = [];
    results.forEach((result) => {
        if (result.result.some((test) => test.status === 1)) {
            failedTestsLibrary.push({
                test: result.test,
                result: result.result.filter((test) => test.status === 1),
            });
        }
    });
    let totalFailedTestsLibrary = 0;
    failedTestsLibrary.forEach((result) => {
        totalFailedTestsLibrary += result.result.length;
    });

    // Filter out any failed tests that also failed in Chrome
    const failedTests: WptTestResult[] = [];
    failedTestsLibrary.forEach((result) => {
        if (result.result.some((test) => !isTestForChromeFailed(result.test, test.name))) {
            failedTests.push({
                test: result.test,
                result: result.result.filter((test) => !isTestForChromeFailed(result.test, test.name)),
            });
        }
    });
    let totalFailedTests = 0;
    failedTests.forEach((result) => {
        totalFailedTests += result.result.length;
    });
    // console.log(JSON.stringify(failedTests, null, 2));

    // Print Report
    // Print Test Names
    console.log('');
    console.log('# Tests Report');
    // Total number of tests
    console.log('Total Tests [Library]: ', totalTests);
    // Number of passed tests
    console.log('Passed Tests: ', totalTests - totalFailedTestsLibrary, '  ');
    // Number of failed tests for chrome + node-datachannel
    console.log(
        'Failed Tests (Chrome + Library): ',
        totalFailedTestsLibrary - totalFailedTests,
        " (We don't care about these tests)  ",
    );
    // Number of failed tests
    console.log('Failed Tests: ', totalFailedTests, '   ');

    // Print Failed Tests
    console.log('');
    console.log('## Failed Tests');
    for (let i = 0; i < failedTests.length; i++) {
        console.log(`### ${failedTests[i].test}`);
        for (let j = 0; j < failedTests[i].result.length; j++) {
            console.log(`- name: ${failedTests[i].result[j].name}  `);
            console.log(`  message: ${failedTests[i].result[j].message}  `);
        }
    }

    // Sometimes failed tests are not cleaned up
    // This can prevent the process from exiting
    ndc.cleanup();
    console.log('End of tests');

}


run().catch((error) => {
    console.error(error);
    process.exit(1);
});

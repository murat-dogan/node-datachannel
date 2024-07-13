// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ndc from '../../lib/index.js';
import wptTestList from './wpt-test-list.js';
import { runWptTests } from './wpt.js';
import { runChromeTests, isTestForChromeFailed, getTotalNumberOfTests } from './chrome-failed-tests.js';

// Set the log level, for debugging purposes
// ndc.initLogger('Debug');

// Run tests for Chrome
console.log('Running tests for Chrome...');
await runChromeTests(wptTestList);
//console.log(JSON.stringify(getChromeFailedTests(), null, 2));

// Run tests for node-datachannel
console.log('Running tests for node-datachannel...');
let results = await runWptTests(wptTestList);

// Calc total number of tests
let totalTests = 0;
results.forEach((result) => {
    totalTests += result.result.length;
});

// Compare results
// Filter failed tests for node-datachannel
let failedTestsLibrary = [];
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
// console.log(JSON.stringify(failedTestsLibrary, null, 2));

// Filter out any failed tests that also failed in Chrome
let failedTests = [];
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
console.log(`Tests Run for:\n${wptTestList}`);
// Total number of tests
console.log('Total Tests [Chrome]               : ', getTotalNumberOfTests());
console.log(
    'Total Tests [Library]              : ',
    totalTests,
    ' (We expect this to be equal to Total Tests [Chrome])',
);
// Number of passed tests
console.log('Passed Tests                       : ', totalTests - totalFailedTestsLibrary);
// Number of failed tests for chrome + node-datachannel
console.log(
    'Failed Tests (Chrome + Library)    : ',
    totalFailedTestsLibrary - totalFailedTests,
    " (We don't care about these tests)",
);
// Number of failed tests
console.log('Failed Tests                       : ', totalFailedTests);
console.log(JSON.stringify(failedTests, null, 2));

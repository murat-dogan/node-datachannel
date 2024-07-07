import wptTestList from './wpt-test-list.js';
import { runWptTests } from './wpt.js';

// Some tests also fail in Chrome, so we need to keep track of them
// so we can skip them.
let chromeFailedTests = [];

export async function runChromeTests() {
    chromeFailedTests = [];
    let results = await runWptTests(wptTestList, true);
    for (let i = 0; i < results.length; i++) {
        if (results[i].result.some((test) => test.status === 1)) {
            chromeFailedTests.push(results[i]);
        }
    }
}

export function getChromeFailedTests() {
    return chromeFailedTests;
}

export function isChromeFailed(testPath, testName) {
    return chromeFailedTests.some(
        (test) =>
            test.test === testPath && test.result.some((result) => result.name === testName && result.status === 1),
    );
}

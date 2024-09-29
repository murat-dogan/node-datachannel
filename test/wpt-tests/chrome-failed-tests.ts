import fs from 'fs';
import path from 'path';
import { runWptTests, WptTestResult } from './wpt';

// Some tests also fail in Chrome
// We don't also care about them
let chromeFailedTests: WptTestResult[] = [];
let totalNumberOfTests = 0;

export async function runChromeTests(wptTestList: string[]): Promise<void> {
    chromeFailedTests = [];
    totalNumberOfTests = 0;
    if (!process.env.NO_CACHE_FOR_CHROME_TESTS) {
        console.log("Default is to read chromeFailedTests from json file");
        console.log("While it takes time to run all tests");
        console.log("Set NO_CACHE_FOR_CHROME_TESTS to true in order to run all tests from scratch");
        const filePath = path.join(__dirname, 'chromeFailedTests.json');
        if (fs.existsSync(filePath)) {
            const chromeFailedTestsFromFile = JSON.parse(fs.readFileSync(filePath).toString());
            // Filter out tests that are not in wptTestList
            chromeFailedTests = chromeFailedTestsFromFile.filter((test: WptTestResult) => wptTestList.includes(test.test));
            for (let i = 0; i < chromeFailedTests.length; i++) {
                totalNumberOfTests += chromeFailedTests[i].result.length;
            }
        }
        return;
    }

    const results = await runWptTests(wptTestList, true);
    for (let i = 0; i < results.length; i++) {
        totalNumberOfTests += results[i].result?.length || 0;
        if (results[i].result && results[i].result.some((test) => test.status === 1)) {
            chromeFailedTests.push({
                test: results[i].test,
                result: results[i].result.filter((test) => test.status === 1),
            });
        }
    }

    // Write chromeFailedTests to json file
    const filePath = path.join(__dirname, 'chromeFailedTests.json');
    fs.writeFileSync(filePath, JSON.stringify(chromeFailedTests, null, 2));
}

export function getChromeFailedTests(): WptTestResult[] {
    return chromeFailedTests;
}

export function isTestForChromeFailed(testPath, testName): boolean {
    return chromeFailedTests.some(
        (test) =>
            test.test === testPath && test.result.some((result) => result.name === testName && result.status === 1),
    );
}

export function getTotalNumberOfTests(): number {
    return totalNumberOfTests;
}

// Test
// (async () => {
//     await runChromeTests();
//     console.log(getChromeFailedTests());
// })();

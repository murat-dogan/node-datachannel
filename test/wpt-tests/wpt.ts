// Run WPT manually before calling this script

import { JSDOM, VirtualConsole } from 'jsdom';
import { TextEncoder, TextDecoder } from 'util';
import puppeteer, { Browser } from 'puppeteer';
import ndcPolyfill from '../../src/polyfill/index';

export interface TestResult {
    name: string;
    message: string;
    status: number // 0: PASS, 1: FAIL, 2: TIMEOUT, 3: PRECONDITION_FAILED
}

export interface WptTestResult {
    test: string;
    result: TestResult[];
}

export async function runWptTests(wptTestList: string[], _forChrome = false, _wptServerUrl = 'http://web-platform.test:8000'): Promise<WptTestResult[]> {
    let browser: Browser = null;
    const results: WptTestResult[] = [];

    if (_forChrome)
        browser = await puppeteer.launch({
            headless: true,
            devtools: true,
        });

    // call runTest for each test path
    for (let i = 0; i < wptTestList.length; i++) {
        console.log(`Running test: ${wptTestList[i]}  `);
        const path = `${_wptServerUrl}${wptTestList[i]}`;
        const result: TestResult[] = _forChrome ? await runTestForChrome(browser, path) : await runTestForLibrary(path);
        results.push({ test: wptTestList[i], result });

        // sleep for 1 second
        // await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // close the client
    if (_forChrome) await browser.close();

    return results;
}

function runTestForLibrary(filePath: string): Promise<TestResult[]> {
    // return new promise
    return new Promise((resolve) => {
        const virtualConsole = new VirtualConsole();
        virtualConsole.sendTo(console);

        JSDOM.fromURL(filePath, {
            runScripts: 'dangerously',
            resources: 'usable',
            pretendToBeVisual: true,
            virtualConsole,
            beforeParse(window: any) {
                // Assign the  polyfill to the window object
                Object.assign(window, ndcPolyfill);

                // Overwrite the DOMException object
                window.DOMException = DOMException;
                window.TypeError = TypeError;
                window.TextEncoder = TextEncoder;
                window.TextDecoder = TextDecoder;
                window.Uint8Array = Uint8Array;
                window.ArrayBuffer = ArrayBuffer;
            },
        }).then((dom: any) => {
            // Get the window object from the DOM
            const { window } = dom;
            window.addEventListener('load', () => {
                window.add_completion_callback((results) => {
                    window.close();

                    // Meaning of status
                    // 0: PASS (test passed)
                    // 1: FAIL (test failed)
                    // 2: TIMEOUT (test timed out)
                    // 3: PRECONDITION_FAILED (test skipped)
                    const returnObject = [];
                    for (let i = 0; i < results.length; i++) {
                        returnObject.push({
                            name: results[i].name,
                            message: results[i].message,
                            status: results[i].status,
                        });
                    }
                    return resolve(returnObject);
                });
            });
        });
    });
}

async function runTestForChrome(browser: Browser, filePath: string): Promise<TestResult[]> {
    const page = await browser.newPage();
    // Evaluate the script in the page context
    await page.evaluateOnNewDocument(() => {
        function createDeferredPromise(): Promise<any> {
            let resolve: any, reject: any;

            const promise = new Promise(function (_resolve, _reject) {
                resolve = _resolve;
                reject = _reject;
            });

            (promise as any).resolve = resolve;
            (promise as any).reject = reject;
            return promise;
        }

        window.addEventListener('load', () => {
            (window as any).resultPromise = createDeferredPromise();
            (window as any).add_completion_callback((results) => {
                // window.returnTestResults.push({ name: test.name, message: test.message, status: test.status });
                const returnTestResults = [];
                for (let i = 0; i < results.length; i++) {
                    returnTestResults.push({
                        name: results[i].name,
                        message: results[i].message,
                        status: results[i].status,
                    });
                }
                (window as any).resultPromise.resolve(returnTestResults);
            });
        });
    });

    // Navigate to the specified URL
    await page.goto(filePath, { waitUntil: 'load' });

    // get the results
    const results = await page.evaluate(() => {
        return (window as any).resultPromise;
    });

    // close the page
    await page.close();

    return results;
}

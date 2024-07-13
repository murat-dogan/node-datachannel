// Run WPT manually before calling this script

import { JSDOM, VirtualConsole } from 'jsdom';
import puppeteer from 'puppeteer';
import ndcPolyfill from '../../polyfill/index.js';


export async function runWptTests(wptTestList, _forChrome = false, _wptServerUrl = 'http://web-platform.test:8000') {
    const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
    });
    let results = [];

    // call runTest for each test path
    for (let i = 0; i < wptTestList.length; i++) {
        console.log(`Running test: ${wptTestList[i]}  `);
        const path = `${_wptServerUrl}${wptTestList[i]}`;
        const result = _forChrome ? await runTestForChrome(browser, path) : await runTestForLibrary(path);
        results.push({ test: wptTestList[i], result });

        // sleep for 1 second
        // await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // close the client
    await browser.close();

    return results;
}

function runTestForLibrary(filePath) {
    // return new promise
    return new Promise((resolve, reject) => {
        const virtualConsole = new VirtualConsole();
        virtualConsole.sendTo(console);

        JSDOM.fromURL(filePath, {
            runScripts: 'dangerously',
            resources: 'usable',
            pretendToBeVisual: true,
            virtualConsole,
            beforeParse(window) {
                // Assign the  polyfill to the window object
                Object.assign(window, ndcPolyfill);

                // Overwrite the DOMException object
                window.DOMException = DOMException;
                window.TypeError = TypeError;
            },
        }).then((dom) => {
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

async function runTestForChrome(browser, filePath) {
    const page = await browser.newPage();
    // Evaluate the script in the page context
    await page.evaluateOnNewDocument(() => {
        window.addEventListener('load', () => {
            window.add_completion_callback((results) => {
                // window.returnTestResults.push({ name: test.name, message: test.message, status: test.status });
                window.returnTestResults = [];
                for (let i = 0; i < results.length; i++) {
                    window.returnTestResults.push({
                        name: results[i].name,
                        message: results[i].message,
                        status: results[i].status,
                    });
                }
            });
        });
    });

    // Navigate to the specified URL
    await page.goto(filePath, { waitUntil: 'networkidle0' });

    // get the results
    const results = await page.evaluate(() => {
        return window.returnTestResults;
    });

    // close the page
    await page.close();

    return results;
}

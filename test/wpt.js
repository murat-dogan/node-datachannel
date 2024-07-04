// Run WPT manually before calling this script

import { JSDOM } from 'jsdom';
import nodeDataChannel from '../polyfill/index.js';

const WPT_SERVER_URL = 'http://web-platform.test:8000';
const WPT_TEST_PATH_LIST = ['/webrtc/RTCPeerConnection-addIceCandidate.html', '/webrtc/RTCDataChannel-send.html'];

// call runTest for each test path
for (let i = 0; i < WPT_TEST_PATH_LIST.length; i++) {
    let result = await runTest(`${WPT_SERVER_URL}${WPT_TEST_PATH_LIST[i]}`);
    console.log(result);

    // sleep for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
}

function runTest(filePath) {
    // return new promise
    return new Promise((resolve, reject) => {
        JSDOM.fromURL(filePath, {
            runScripts: 'dangerously',
            resources: 'usable',
            pretendToBeVisual: true,
        }).then((dom) => {
            const { window } = dom;

            // Assign the  polyfill to the window object
            Object.assign(window, nodeDataChannel);
            // Overwrite the DOMException object
            window.DOMException = DOMException;

            const returnObject = [];
            window.addEventListener('load', () => {
                window.add_result_callback((test) => {
                    // Meaning of status
                    // 0: PASS (test passed)
                    // 1: FAIL (test failed)
                    // 2: TIMEOUT (test timed out)
                    // 3: PRECONDITION_FAILED (test skipped)
                    returnObject.push({ name: test.name, message: test.message, status: test.status });
                });

                window.add_completion_callback(() => {
                    window.close();
                    return resolve(returnObject);
                });
            });
        });
    });
}

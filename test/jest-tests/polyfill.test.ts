import { expect } from '@jest/globals';
import polyfill from '../../src/polyfill/index';

describe('polyfill', () => {
    test('generateCertificate should throw', async () => {
        await expect(async () => {
            await polyfill.RTCPeerConnection.generateCertificate();
        }).rejects.toEqual(new DOMException('Not implemented'));
    });
});

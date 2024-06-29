import { expect, jest } from '@jest/globals';
import polyfill from '../../polyfill/index.js';
import { PeerConnection } from '../../lib';

describe('polyfill', () => {
    test('generateCertificate should throw', () => {
        expect(async () => {
            await polyfill.RTCPeerConnection.generateCertificate({});
        }).rejects.toEqual(new DOMException('Not implemented'));
    });

    test('it should accept a preconfigured PeerConnection', () => {
        const peerConnection = new PeerConnection('Peer', {
            iceServers: [],
        });

        // have to override write-only method in order to spy on it
        const originalFunc = peerConnection.state.bind(peerConnection);
        Object.defineProperty(peerConnection, 'state', {
            value: originalFunc,
            writable: true,
            enumerable: true,
        });

        const spy = jest.spyOn(peerConnection, 'state');
        const rtcPeerConnection = new polyfill.RTCPeerConnection({
            peerConnection,
        });
        const connectionState = rtcPeerConnection.connectionState;
        expect(spy).toHaveBeenCalled();
        expect(connectionState).toEqual(originalFunc());
    });
});

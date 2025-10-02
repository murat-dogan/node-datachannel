/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, jest } from '@jest/globals';
import { RTCPeerConnection } from '../../src/polyfill/index';
import { PeerConnection } from '../../src/lib/index';
import { eventPromise } from '../fixtures/event-promise';
import { connect } from '../fixtures/connect';

// Polyfill for Promise.withResolvers for Node < 20
if (!Promise.withResolvers) {
  (Promise as any).withResolvers = function <T>(): any {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}

describe('polyfill', () => {
  // Default is 5000 ms but we need more
  jest.setTimeout(30000);

  test('generateCertificate should throw', async () => {
    await expect(async () => {
      await RTCPeerConnection.generateCertificate();
    }).rejects.toEqual(new DOMException('Not implemented'));
  });

  test('can assign polyfill to global type', () => {
    // complication check to ensure the interface is implemented correctly
    const pc: globalThis.RTCPeerConnection = new RTCPeerConnection();
    expect(pc).toBeTruthy();
  });

  test('P2P Test', async () => {
    // Mocks
    const p1ConnectionStateMock = jest.fn();
    const p1IceConnectionStateMock = jest.fn();
    const p1IceGatheringStateMock = jest.fn();
    const p1IceCandidateMock = jest.fn();
    const p1SDPMock = jest.fn();
    const p1DCMock = jest.fn();
    const p1MessageMock = jest.fn();
    const p2ConnectionStateMock = jest.fn();
    const p2IceConnectionStateMock = jest.fn();
    const p2IceGatheringStateMock = jest.fn();
    const p2IceCandidateMock = jest.fn();
    const p2SDPMock = jest.fn();
    const p2DCMock = jest.fn();
    const p2MessageMock = jest.fn();

    const peer1 = new RTCPeerConnection({
      peerIdentity: 'peer1',
      iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
    });

    const peer2 = new RTCPeerConnection({
      peerIdentity: 'peer2',
      iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
    });

    let dc1: RTCDataChannel = null;
    let dc2: RTCDataChannel = null;

    // Creates a fixed binary data for testing
    function createBinaryTestData(binaryData = new ArrayBuffer(17), offset = 0): ArrayBufferView {
      const dv = new DataView(binaryData, offset);
      dv.setInt8(0, 123);
      dv.setFloat32(1, 123.456);
      dv.setUint32(5, 987654321);
      dv.setFloat64(9, 789.012);
      return new Uint8Array(binaryData, offset, 17);
    }

    // Compares the received binary data to the expected value of the fixed binary data
    function analyzeBinaryTestData(binaryData: ArrayBufferLike): boolean {
      const dv = new DataView(binaryData);
      return (
        dv.getInt8(0) == 123 &&
        dv.getFloat32(1) == Math.fround(123.456) &&
        dv.getUint32(5) == 987654321 &&
        dv.getFloat64(9) == 789.012
      );
    }

    // We will set the "binaryType" and then send/receive the "data" from the datachannel in each test, and then compare them.
    // For example, the first line will send a "Hello" string after setting binaryType to "arraybuffer".
    const testMessages = [
      { binaryType: 'arraybuffer', data: 'Hello' },
      { binaryType: 'arraybuffer', data: createBinaryTestData() },
      { binaryType: 'arraybuffer', data: createBinaryTestData(new ArrayBuffer(100)) },
      { binaryType: 'arraybuffer', data: createBinaryTestData(new ArrayBuffer(100), 50) },
      { binaryType: 'arraybuffer', data: createBinaryTestData(new ArrayBuffer(100), 50) },
      { binaryType: 'blob', data: 'Hello' },
      { binaryType: 'blob', data: new Blob([createBinaryTestData()]) },
    ];

    const testMessageCount = Object.keys(testMessages).length;

    // Index of the message in testMessages that we are currently testing.
    let currentIndex: number = -1;

    // We run this function to analyze the data just after receiving it from the datachannel.
    async function analyzeData(idx: number, data: Blob | ArrayBuffer | string): Promise<boolean> {
      switch (idx) {
        case 0: // binaryType is not used here because data is a string ("Hello").
          return data === 'Hello';
        case 1: // binaryType is "arraybuffer" and data is expected to be an ArrayBuffer.
          return analyzeBinaryTestData(data as ArrayBufferLike);
        case 2: // binaryType is "arraybuffer" and data is expected from a view on a larger ArrayBuffer
          return analyzeBinaryTestData(data as ArrayBufferLike);
        case 3: // binaryType is "arraybuffer" and data was created from a view on a larger ArrayBuffer with an offset
          return analyzeBinaryTestData(data as ArrayBufferLike);
        case 4: // binaryType is "arraybuffer" and data was created from a view on a larger ArrayBuffer with an offset
          return analyzeBinaryTestData(data as ArrayBufferLike);
        case 5: // binaryType is "blob" and data is expected to be a string ("Hello").
          return data === 'Hello';
        case 6: // binaryType is "blob" and data is expected to be a Blob.
          return analyzeBinaryTestData(await (data as Blob).arrayBuffer());
      }
      return false;
    }

    async function finalizeTest(): Promise<void> {
      peer1.close();
      peer2.close();

      // State Callbacks
      expect(p1ConnectionStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(p2ConnectionStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(p1IceConnectionStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(p2IceConnectionStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(p1IceGatheringStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(p2IceGatheringStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);

      // SDP
      expect(p1SDPMock.mock.calls.length).toBe(1);
      expect(p2SDPMock.mock.calls.length).toBe(1);

      // Candidates
      expect(p1IceCandidateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
      expect(p2IceCandidateMock.mock.calls.length).toBeGreaterThanOrEqual(1);

      // DataChannel
      expect(p1DCMock.mock.calls.length).toBe(1);
      expect(p2DCMock.mock.calls.length).toBe(1);

      expect(p1MessageMock.mock.calls.length).toBe(testMessageCount);
      expect(p2MessageMock.mock.calls.length).toBe(testMessageCount);

      // Analyze and compare received messages
      for (let i = 0; i < testMessageCount; i++) {
        expect(await analyzeData(i, p1MessageMock.mock.calls[i][0] as any)).toEqual(true);
        expect(await analyzeData(i, p2MessageMock.mock.calls[i][0] as any)).toEqual(true);
      }
    }

    // starts the next message-sending test
    async function nextSendTest(): Promise<void> {
      // Get the next test data
      const current = testMessages[++currentIndex];

      if (!current) {
        return;
      }

      // Assign the binaryType value
      dc1.binaryType = current.binaryType as BinaryType;

      // dc2 also is initialized ?
      if (dc2) {
        dc2.binaryType = current.binaryType as BinaryType;
      }

      // Send the test message
      dc1.send(current.data);
    }

    // Set Callbacks
    peer1.onconnectionstatechange = (): void => {
      p1ConnectionStateMock();
    };
    peer1.oniceconnectionstatechange = (): void => {
      p1IceConnectionStateMock();
    };
    peer1.onicegatheringstatechange = (): void => {
      p1IceGatheringStateMock();
    };
    peer1.onicecandidate = (e): void => {
      p1IceCandidateMock();
      peer2.addIceCandidate(e.candidate);
    };

    // Set Callbacks
    peer2.onconnectionstatechange = (): void => {
      p2ConnectionStateMock();
    };
    peer2.oniceconnectionstatechange = (): void => {
      p2IceConnectionStateMock();
    };
    peer2.onicegatheringstatechange = (): void => {
      p2IceGatheringStateMock();
    };
    peer2.onicecandidate = (e): void => {
      p2IceCandidateMock();
      peer1.addIceCandidate(e.candidate);
    };
    peer2.ondatachannel = (dce): void => {
      p2DCMock();
      dc2 = dce.channel;
      dc2.onmessage = (msg): void => {
        p2MessageMock(msg.data);

        // send the received message from peer2 back to peer1
        dc2.send(msg.data);
      };
    };

    // Actions
    peer1.createOffer().then((desc) => {
      p1SDPMock();
      peer2.setRemoteDescription(desc);
    });
    //.catch((err) => console.error(err));

    peer2.createAnswer().then((answerDesc) => {
      p2SDPMock();
      peer1.setRemoteDescription(answerDesc);
    });
    //.catch((err) => console.error('Couldn't create answer', err));

    const sentAll = Promise.withResolvers<void>();

    dc1 = peer1.createDataChannel('test-p2p');
    dc1.onopen = (): void => {
      p1DCMock();

      nextSendTest().catch((err) => {
        sentAll.reject(err);
      });
    };
    dc1.onmessage = (msg): void => {
      // peer2 sends all messages back to peer1
      p1MessageMock(msg.data);

      if (p1MessageMock.mock.calls.length === testMessageCount) {
        finalizeTest()
          .then(() => {
            sentAll.resolve();
          })
          .catch((err) => {
            sentAll.reject(err);
          });
      } else {
        nextSendTest().catch((err) => {
          sentAll.reject(err);
        });
      }
    };

    await sentAll.promise;
  });

  test('it can access datachannel informational fields after closing', async () => {
    const peer1 = new RTCPeerConnection();
    const peer2 = new RTCPeerConnection();

    const label = 'label';
    const protocol = 'protocol';

    const dc: RTCDataChannel = peer1.createDataChannel(label, {
      protocol,
    });

    // Actions
    const peer1Offer = await peer1.createOffer();
    await peer2.setRemoteDescription(peer1Offer);

    const peer2Answer = await peer2.createAnswer();
    await peer1.setRemoteDescription(peer2Answer);

    peer1.addEventListener('icecandidate', (e: RTCPeerConnectionIceEvent) => {
      peer2.addIceCandidate(e.candidate);
    });

    peer2.addEventListener('icecandidate', (e: RTCPeerConnectionIceEvent) => {
      peer1.addIceCandidate(e.candidate);
    });

    await eventPromise(dc, 'open');

    const id = dc.id;
    expect(dc.label).toEqual(label);
    expect(dc.protocol).toEqual(protocol);

    peer1.close();
    peer2.close();

    if (dc.readyState !== 'closed') {
      await eventPromise(dc, 'close');
    }

    expect(dc.readyState).toEqual('closed');
    expect(dc.id).toEqual(id);
    expect(dc.label).toEqual(label);
    expect(dc.protocol).toEqual(protocol);
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
    const rtcPeerConnection = new RTCPeerConnection({
      peerConnection,
    });
    const connectionState = rtcPeerConnection.connectionState;
    expect(spy).toHaveBeenCalled();
    expect(connectionState).toEqual(originalFunc());
  });

  test('it should send mixed types in order', async () => {
    const peer1 = new RTCPeerConnection();
    const peer2 = new RTCPeerConnection();

    await connect(peer1, peer2);

    const receivedAllMessages = Promise.withResolvers<any[]>();

    peer2.ondatachannel = (evt): void => {
      const channel = evt.channel;
      const output = [];

      channel.onmessage = (evt): void => {
        output.push(evt.data);

        if (output.length === 2) {
          receivedAllMessages.resolve(output);
        }
      };
    };

    const dc = peer1.createDataChannel('');

    await eventPromise(dc, 'open');

    dc.send(new Blob(['hello']));
    dc.send('world');

    const messages = await receivedAllMessages.promise;

    expect(messages[0]).toBeInstanceOf(ArrayBuffer);
    expect(new TextDecoder().decode(messages[0])).toEqual('hello');
    expect(messages[1]).toEqual('world');

    peer1.close();
    peer2.close();
  });
});

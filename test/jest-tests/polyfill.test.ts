import { expect } from '@jest/globals';
import { RTCPeerConnection, RTCDataChannel } from '../../src/polyfill/index';

describe('polyfill', () => {
	test('generateCertificate should throw', async () => {
		await expect(async () => {
			await RTCPeerConnection.generateCertificate();
		}).rejects.toEqual(new DOMException('Not implemented'));
	});
	test('P2P Test', () => {
		return new Promise<void>((done) => {
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

			let dc1: RTCDataChannel = null;
			let dc2: RTCDataChannel = null;

			function createBinaryTestData(){
				let binaryData = new Uint8Array(17);
				let dv = new DataView(binaryData.buffer);
				dv.setInt8(0, 123);
				dv.setFloat32(1, 123.456);
				dv.setUint32(5, 987654321);
				dv.setFloat64(9, 789.012);
				return binaryData;
			}
			function analyzeBinaryTestData(binaryData){
				let dv = new DataView(binaryData);
				return (dv.getInt8(0)==123 && dv.getFloat32(1)==Math.fround(123.456) && dv.getUint32(5)==987654321 && dv.getFloat64(9)==789.012);
			}
			const testMessages = [
				{ binaryType: 'arraybuffer', data: 'Hello' },
				{ binaryType: 'arraybuffer', data: createBinaryTestData() },
				{ binaryType: 'blob', data: createBinaryTestData() }
			];
			var currentIndex = -1;
			function analyzeData(idx, data){
				switch(idx){
					case 0:
						return data==testMessages[idx].data;
					case 1:
						return analyzeBinaryTestData(data);
					case 2:
						return analyzeBinaryTestData(data.buffer);
				}
				return false;
			}
			function nextSendTest(){
				var current = testMessages[++currentIndex];
				if (!current)
					return false;
				dc1.binaryType = current.binaryType as BinaryType;
				dc2.binaryType = current.binaryType as BinaryType;
				dc1.send(current.data);
				return true;
			}
			
			const peer1 = new RTCPeerConnection({
				peerIdentity: 'peer1',
				iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
			});
			
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
			
			const peer2 = new RTCPeerConnection({
				peerIdentity: 'peer2',
				iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
			});
			
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
					dc2.send(msg.data);
				};
			};
			
			dc1 = peer1.createDataChannel('test-p2p');
			dc1.onopen = (): void => {
				p1DCMock();
				nextSendTest();
			};
			dc1.onmessage = (msg): void => {
				p1MessageMock(msg.data);
				if (!nextSendTest()){
					peer1.close();
					peer2.close();
					expect(p1ConnectionStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
					expect(p2ConnectionStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
					expect(p1IceConnectionStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
					expect(p2IceConnectionStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
					expect(p1IceGatheringStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
					expect(p2IceGatheringStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
					expect(p1IceCandidateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
					expect(p2IceCandidateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
					expect(p1SDPMock.mock.calls.length).toBe(1);
					expect(p2SDPMock.mock.calls.length).toBe(1);
					expect(p1DCMock.mock.calls.length).toBe(1);
					expect(p2DCMock.mock.calls.length).toBe(1);
					expect(p1MessageMock.mock.calls.length).toBe(3);
					expect(p2MessageMock.mock.calls.length).toBe(3);
					expect(analyzeData(0, p1MessageMock.mock.calls[0][0])).toEqual(true);
					expect(analyzeData(0, p2MessageMock.mock.calls[0][0])).toEqual(true);
					expect(analyzeData(1, p1MessageMock.mock.calls[1][0])).toEqual(true);
					expect(analyzeData(1, p2MessageMock.mock.calls[1][0])).toEqual(true);
					expect(analyzeData(2, p1MessageMock.mock.calls[2][0])).toEqual(true);
					expect(analyzeData(2, p2MessageMock.mock.calls[2][0])).toEqual(true);
					done();
				}
			};
			peer1
				.createOffer()
				.then((desc) => {
					p1SDPMock();
					peer2.setRemoteDescription(desc);
				})
				//.catch((err) => console.error(err));
			
			peer2
				.createAnswer()
				.then((answerDesc) => {
					p2SDPMock();
					peer1.setRemoteDescription(answerDesc);
				})
				//.catch((err) => console.error('Couldn't create answer', err));
		});
	});
});

import { eventPromise } from './event-promise';

export async function connect (peer1: RTCPeerConnection, peer2: RTCPeerConnection): Promise<void> {
  const dc: RTCDataChannel = peer1.createDataChannel('');

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

  dc.close();

  await eventPromise(dc, 'close');
}

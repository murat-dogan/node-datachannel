import * as nodeDataChannel from '../../src/lib/index';

afterAll(() => {
  // Release native peer/track callbacks after the local SRTP exchange.
  nodeDataChannel.cleanup();
});

describe('RtcpReceivingSession synchronization timestamps', () => {
  test('returns a detached zero snapshot before receiving a sender report', () => {
    const session = new nodeDataChannel.RtcpReceivingSession();
    const timestamps = session.getSyncTimestamps();
    expect(timestamps).toEqual({ rtpTimestamp: 0, ntpTimestamp: 0n });
    timestamps.rtpTimestamp = 123;
    timestamps.ntpTimestamp = 456n;
    expect(session.getSyncTimestamps()).toEqual({ rtpTimestamp: 0, ntpTimestamp: 0n });
    expect(session.getSyncTimestamps()).not.toBe(timestamps);
  });

  test('preserves unsigned RTP and full 64-bit NTP values from an incoming sender report', async () => {
    const senderPeer = new nodeDataChannel.PeerConnection('SR sender', { iceServers: [] });
    const receiverPeer = new nodeDataChannel.PeerConnection('SR receiver', { iceServers: [] });
    const session = new nodeDataChannel.RtcpReceivingSession();
    const audio = new nodeDataChannel.Audio('audio', 'SendOnly');
    audio.addOpusCodec(111);
    audio.addSSRC(1234, 'sender');
    const sender = senderPeer.addTrack(audio);

    try {
      await new Promise<void>((resolve, reject) => {
        senderPeer.onLocalDescription((sdp, type) => receiverPeer.setRemoteDescription(sdp, type));
        receiverPeer.onLocalDescription((sdp, type) => senderPeer.setRemoteDescription(sdp, type));
        senderPeer.onLocalCandidate((candidate, mid) =>
          receiverPeer.addRemoteCandidate(candidate, mid),
        );
        receiverPeer.onLocalCandidate((candidate, mid) =>
          senderPeer.addRemoteCandidate(candidate, mid),
        );
        receiverPeer.onTrack((track) => track.setMediaHandler(session));
        sender.onOpen(resolve);
        sender.onError((error) => reject(new Error(error)));
        senderPeer.setLocalDescription();
      });

      // Send a real SR over the local DTLS/SRTP connection. The odd low bits and
      // high bit of NTP detect both Number precision loss and signed conversion.
      const ntpTimestamp = 0xfedcba9876543211n;
      const rtpTimestamp = 0xfedcba98;
      const report = Buffer.alloc(28);
      report[0] = 0x80;
      report[1] = 200;
      report.writeUInt16BE(6, 2);
      report.writeUInt32BE(1234, 4);
      report.writeBigUInt64BE(ntpTimestamp, 8);
      report.writeUInt32BE(rtpTimestamp, 16);
      expect(sender.sendMessageBinary(report)).toBe(true);

      const deadline = Date.now() + 5000;
      while (session.getSyncTimestamps().ntpTimestamp === 0n && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      const timestamps = session.getSyncTimestamps();
      expect(timestamps).toEqual({ rtpTimestamp, ntpTimestamp });
      timestamps.ntpTimestamp = 0n;
      expect(session.getSyncTimestamps()).toEqual({ rtpTimestamp, ntpTimestamp });
    } finally {
      senderPeer.close();
      receiverPeer.close();
    }
  }, 15000);
});

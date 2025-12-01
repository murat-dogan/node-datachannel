import readline from 'readline';
import nodeDataChannel from 'node-datachannel';
import { readFile } from 'fs/promises';

// These are generated with
// ffmpeg -f lavfi -i "color=c=red:s=1920x1080:r=1:d=1" -c:v libx264 -pix_fmt yuv420p frame-r.h264
const frames = Promise.all([
  readFile("./frame-r.h264"),
  readFile("./frame-g.h264"),
  readFile("./frame-b.h264"),
])

// Read Line Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Init Logger
nodeDataChannel.initLogger('Debug');

let peerConnection = new nodeDataChannel.PeerConnection('pc', {
  iceServers: [],
});

peerConnection.onStateChange((state) => {
  console.log('State: ', state);
});
peerConnection.onGatheringStateChange((state) => {
  // console.log('GatheringState: ', state);

  if (state == 'complete') {
    let desc = peerConnection.localDescription();
    console.log('');
    console.log('## Please copy the offer below to the web page:');
    console.log(JSON.stringify(desc));
    console.log('\n\n');
    rl.question('## Please copy/paste the answer provided by the browser: \n', (sdp) => {
      let sdpObj = JSON.parse(sdp);
      peerConnection.setRemoteDescription(sdpObj.sdp, sdpObj.type);
      console.log(track.isOpen());
      rl.close();
    });
    console.log('## Expect to see color cycling on the browser');
  }
});

let video = new nodeDataChannel.Video('video', 'SendOnly');
video.addH264Codec(96);
video.setBitrate(3000);

let rtpConfig = new nodeDataChannel.RtpPacketizationConfig(12345, "", 96, 90000);
let packetizer = new nodeDataChannel.H264RtpPacketizer("StartSequence", rtpConfig);
let track = peerConnection.addTrack(video);
track.setMediaHandler(packetizer);
track.onOpen(async () => {
  let timestamp = 0;
  let i = 0;
  let framesAwaited = await frames;
  setInterval(() => {
    console.log(`Sending frame ${i}`)
    rtpConfig.timestamp = rtpConfig.clockRate * timestamp;
    track.sendMessageBinary(framesAwaited[i++ % 3]);
    timestamp += 0.5;
  }, 500);
})

peerConnection.setLocalDescription();

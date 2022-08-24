const io = require("socket.io-client")
const { PeerConnection, Video,Audio } = require('node-datachannel');
const { spawn } = require('child_process')
const UDP = require('./udp.js')
const HOST = 'wss://******' //Your signaling server address
class CarServer {
    constructor() {
        this.Peer = null
        this.track = null
        this.child = null
        this.udp = null
        if (!HOST) console.error('Enter the signaling server address');
        this.socket = io(HOST, {
            auth: {
                roomID: 'test',
                name: '456'
            }
        });
        this.socket.on('connect', this.connected.bind(this))
        this.socket.on('msg', this.onMsg.bind(this))
        this.socket.on('leaved', this.onLeved.bind(this))
        this.socket.on('joined', this.startVideo.bind(this))
    }
    // socket conect
    connected() {
        console.log('connected');
        this.Peer = new PeerConnection("Peer1", { iceServers: [] });
        // send offer
        this.Peer.onGatheringStateChange(state => {
            console.log('GatheringState: ', state);
            if (state === 'complete') {
                const offer = this.Peer.localDescription();
                this.socket.emit("msg", offer);
            }
        })
    }

    // listen data
    onMsg(data) {
        try {
            if (data.type == 'answer') {
                this.Peer.setRemoteDescription(data.sdp, data.type);
            } else if (data.type === 'startRTC') {
                this.startVideo()
            }
        } catch (error) {
            console.log('msg error:', error);
        }
    }

    // listen leave
    onLeved() {
        if (this.child) this.child.kill()
        if (this.udp) this.udp.close()
        this.child = null
        this.udp = null
        process.exit(1)
    }

    // start video
    startVideo() {
        try {
            if (this.child) this.child.kill()
            if (this.udp) this.udp.close()

            // // ------------bullseys 64----------
            // const video = new Video('video', 'SendOnly')
            // video.addH264Codec(96)
            // video.addSSRC(42, "video-send")
            // this.track = this.Peer.addTrack(video)
            // this.Peer.setLocalDescription()

            // // UDP server
            // const port = 7788
            // this.udp = createSocket("udp4")
            // this.udp.bind(port)

            // // video push
            // const args = [
                // "libcamerasrc",
                // "video/x-raw,width=320,height=240",
                // "videoconvert",
                // "queue",
                // "x264enc tune=zerolatency bitrate=1000 key-int-max=30",
                // "video/x-h264, profile=constrained-baseline",
                // "rtph264pay pt=96 mtu=1200 ssrc=42",
                // `udpsink host=127.0.0.1 port=${port}`,
            // ].join(" ! ").split(" ")
            // this.child = spawn("gst-launch-1.0", args)

            // // listen UDP
            // this.udp.on("message", (data) => {
            //     if (!this.track.isOpen()) return
            //     this.track.sendMessageBinary(data)
            // });



            // ---------------buster 32------------------
            const video = new Video('video', 'SendOnly')
            video.addH264Codec(97)
            video.addSSRC(43, "video-send")
            const videoTrack = this.Peer.addTrack(video)
            const videoPort = 47788
            const videoArgs = [
                "v4l2src device=/dev/video0",
                "video/x-raw,width=960,height=720",
                "videoconvert",
                "queue",
                "omxh264enc",
                "video/x-h264,profile=baseline",
                "rtph264pay pt=97 mtu=1200 ssrc=43",
                `udpsink host=127.0.0.1 port=${videoPort}`,
            ].join(" ! ").split(" ")
            spawn("gst-launch-1.0", videoArgs)
            new UDP(videoPort, data => {
                if (!videoTrack.isOpen()) return
                videoTrack.sendMessageBinary(data)
            })  
            // -----------audio--------------     
            const audio = new Audio('audio', 'SendOnly')
            audio.addOpusCodec(96)
            audio.addSSRC(42, "audio-send")
            const audioTrack = this.Peer.addTrack(audio)            
            const audioPort = 47789
            const audioArgs = [
                'alsasrc device=plughw:1,0',
                "audio/x-raw,rate=8000,channels=1",
                "audioconvert",
                "queue",
                "opusenc",
                "rtpopuspay",
                `udpsink host=127.0.0.1 port=${audioPort}`,
            ].join(" ! ").split(" ")
            spawn("gst-launch-1.0", audioArgs)
            new UDP(audioPort, data => {
                if (!audioTrack.isOpen()) return
                audioTrack.sendMessageBinary(data)
            })  
            this.Peer.setLocalDescription()

        } catch (error) {
            console.log('startvideo:', error)
        }
    }

}
new CarServer()


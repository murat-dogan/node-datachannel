const io = require("socket.io-client")
const { PeerConnection, Video, Audio } = require('node-datachannel');
const { spawn } = require('child_process')
const UDP = require('./udp.js')
const HOST = '' //Your signaling server address
const sysType = 'bullseye' // your raspi system version
class CarServer {
    constructor() {
        // ----------init var ----------
        this.Peer = null
        this.videoChild = null
        this.audioChild = null
        this.videoUDP = null
        this.audioUDP = null
        this.videoTrack = null
        this.audioTrack = null
        this.videoPort = Math.floor(Math.random() * (60000 - 50000 + 1)) + 50000
        this.audioPort = Math.floor(Math.random() * (60000 - 50000 + 1)) + 50000
        if (!HOST) console.error('Enter the signaling server address')
        // -------connect socket ----------
        this.socket = io(HOST, {
            auth: {
                roomID: 'test',
                name: '456'
            }
        });
        this.socket.on('connect', this.connected.bind(this))
        this.socket.on('msg', this.onMessage.bind(this))
        this.socket.on('leaved', this.onLeved.bind(this))
        this.socket.on('joined', this.startVideoAudio.bind(this))
    }
    
    // listen conect
    connected() {
        this.Peer = new PeerConnection("Peer1", { iceServers: [] })
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
    onMessage(data) {
        try {
            if (data.type == 'answer') {
                this.Peer.setRemoteDescription(data.sdp, data.type);
            } else if (data.type === 'startRTC') {
                // do something
                this.startVideoAudio()
            }
        } catch (error) {
            console.log('msg error:', error);
        }
    }

    // listen leave
    onLeved() {
        if (this.videoChild) this.videoChild.kill();
        if (this.audioChild) this.audioChild.kill();
        if (this.videoUDP) this.videoUDP.close();
        if (this.audioUDP) this.audioUDP.close();
        this.videoChild = null
        this.audioChild = null
        this.videoUDP = null
        this.audioUDP = null
        this.videoTrack = null
        this.audioTrack = null
    }

    // start video
    startVideoAudio() {
        try {
            if (this.videoChild) { this.videoChild.kill(); this.videoChild = null; }
            if (this.videoUDP) { this.videoUDP.close(); this.videoUDP = null; }
            if (this.audioChild) { this.audioChild.kill(); this.audioChild = null; }
            if (this.audioUDP) { this.audioUDP.close(); this.audioUDP = null; }
            // ---------video--------------
            const video = new Video('video', 'SendOnly')
            video.addH264Codec(97)
            video.addSSRC(43, "video-send")
            this.videoTrack = this.Peer.addTrack(video)
            // use bullseys version or buster version ?
            // Note that the two systems use different video command lines
            const prams = sysType === 'bullseye' ? [
                "libcamerasrc",
                `video/x-raw,width=320,height=240`,
                "videoconvert",
                "queue",
                "x264enc tune=zerolatency bitrate=1024 key-int-max=30 speed-preset=1",
                "video/x-h264, profile=constrained-baseline",
                "rtph264pay pt=97 mtu=1200 ssrc=43",
                `udpsink host=127.0.0.1 port=${this.videoPort}`,
            ] : [
                "v4l2src device=/dev/video0",
                `video/x-raw,width=320,height=240`,
                "videoconvert",
                "queue",
                "omxh264enc",
                "video/x-h264,profile=baseline",
                "rtph264pay pt=97 mtu=1200 ssrc=43",
                `udpsink host=127.0.0.1 port=${this.videoPort}`,
            ];
            const videoArgs = prams.join(" ! ").split(" ")
            this.videoChild = spawn("gst-launch-1.0", videoArgs)
            this.videoUDP = new UDP(this.videoPort, data => {
                if (!this.videoTrack.isOpen()) return
                this.videoTrack.sendMessageBinary(data)
            })

            // -----------audio--------------     
            const audio = new Audio('audio', 'SendOnly')
            audio.addOpusCodec(96)
            audio.addSSRC(42, "audio-send")
            this.audioTrack = this.Peer.addTrack(audio)
            const audioArgs = [
                'alsasrc device=plughw:1,0',
                "audio/x-raw,rate=8000,channels=1",
                "audioconvert",
                "queue",
                "opusenc",
                "rtpopuspay",
                `udpsink host=127.0.0.1 port=${this.audioPort}`,
            ].join(" ! ").split(" ")
            spawn("gst-launch-1.0", audioArgs)
            new UDP(this.audioPort, data => {
                if (!this.audioTrack.isOpen()) return
                this.audioTrack.sendMessageBinary(data)
            })

            // ----------setLocalDescription----------
            this.Peer.setLocalDescription()

        } catch (error) {
            console.log('startVideoAudio:', error)
        }
    }

}
new CarServer()


<template>
  <div id="app">
    <video id="v2" autoplay playsinline muted></video>
  </div>
</template>
<script>
const { io } = require("socket.io-client");
export default {
  data() {
    return {
      socket: null,
      HOST: "", //Your signaling server address
      Peer: null
    };
  },
  methods: {
    intSoketRtc(host) {
      if(!host)  return alert('please change socket address') 
      // int socket
      this.socket = io(host, {
        auth: {
          roomID: "test",
          name: "123",
        },
        transports: ["websocket"],
      });

      // socket
      this.socket.on("connect", () => {
        this.Peer = new RTCPeerConnection({
          bundlePolicy: "max-bundle",
        });

        // listen state
        this.Peer.onicegatheringstatechange = () => {
          console.log("GatheringState: ", this.Peer.iceGatheringState);
          if (this.Peer.iceGatheringState === "complete") {
            const answer = this.Peer.localDescription;
            this.socket.emit("msg", answer);
          }
        };

        // listen track
        this.Peer.ontrack = (evt) => {
          console.log("track", evt.streams[0]);
          const video = document.getElementById("v2");
          video.srcObject = evt.streams[0];
        };

        console.log("connected");
      });

      // listen data
      this.socket.on("msg", async (data) => {
        console.log(data);
        if (data.type == "offer") {
          await this.Peer.setRemoteDescription(data);
          const answer = await this.Peer.createAnswer();
          await this.Peer.setLocalDescription(answer);
        }
      });

      // listen join
      this.socket.on("joined", async (user) => {
        console.log(`${user.name}_${user.ip}_joined_${user.roomID}`);
        this.socket.emit("msg", { type: "startRTC" });
      });

      // listen leave
      this.socket.on("leaved", (user) => {
        console.log(`${user.name}_${user.ip}_leaved_${user.roomID}`);
      });

      // listen error
      this.socket.on("connect_error", (err) => {
        console.log("connect_error", err);
      });
    },
  },
  mounted() {
    this.intSoketRtc(this.HOST);
  },
};
</script>
<style scoped>
video {
  width: 500px;
  height: 500px;
  background: none;
  object-fit: fill;
  border: solid 1px red;
  margin: 0 auto;
}
</style>
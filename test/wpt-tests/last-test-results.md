
> wpt-tests@1.0.0 run:test
> node index.js

# Running tests for Chrome...
Running test: /webrtc/getstats.html  
Running test: /webrtc/historical.html  
Running test: /webrtc/no-media-call.html  
Running test: /webrtc/promises-call.html  
Running test: /webrtc/receiver-track-live.https.html  
Running test: /webrtc/recvonly-transceiver-can-become-sendrecv.https.html  
Running test: /webrtc/RollbackEvents.https.html  
Running test: /webrtc/RTCCertificate.html  
Running test: /webrtc/RTCPeerConnection-addIceCandidate.html  
Running test: /webrtc/RTCPeerConnection-addTcpIceCandidate.html  

# Running tests for node-datachannel...
Running test: /webrtc/getstats.html  
Running test: /webrtc/historical.html  
Running test: /webrtc/no-media-call.html  
Running test: /webrtc/promises-call.html  
Running test: /webrtc/receiver-track-live.https.html  
Running test: /webrtc/recvonly-transceiver-can-become-sendrecv.https.html  
Running test: /webrtc/RollbackEvents.https.html  
Running test: /webrtc/RTCCertificate.html  
Running test: /webrtc/RTCPeerConnection-addIceCandidate.html  
invalid
Running test: /webrtc/RTCPeerConnection-addTcpIceCandidate.html  
audio1
audio1

# Tests Report
Total Tests [Chrome]:  158   
Total Tests [Library]:  158  (We expect this to be equal to Total Tests [Chrome])  
Passed Tests:  119   
Failed Tests (Chrome + Library):  27  (We don't care about these tests)  
Failed Tests:  12    

## Failed Tests
### /webrtc/historical.html
- name: RTCRtpTransceiver member setDirection should not exist  
  message: RTCRtpTransceiver is not defined  
### /webrtc/recvonly-transceiver-can-become-sendrecv.https.html
- name: [audio] recvonly transceiver can become sendrecv  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: [video] recvonly transceiver can become sendrecv  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
### /webrtc/RTCCertificate.html
- name: Constructing RTCPeerConnection with expired certificate should reject with InvalidAccessError  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: Calling setConfiguration with different set of certs should reject with InvalidModificationError  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: RTCCertificate should have at least one fingerprint  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
- name: RTCPeerConnection({ certificates }) should generate offer SDP with fingerprint of provided certificate  
  message: promise_test: Unhandled rejection with value: object "Error: Not implemented"  
### /webrtc/RTCPeerConnection-addIceCandidate.html
- name: addIceCandidate with second sdpMid and sdpMLineIndex should add candidate to second media stream  
  message: assert_true: Expect candidate line to be found after media line m=video expected true got false  
- name: Adding multiple candidates should add candidates to their corresponding media stream  
  message: assert_true: Expect candidate line to be found after media line m=video expected true got false  
- name: Add candidate for media stream 2 with null usernameFragment should succeed  
  message: assert_true: Expect candidate line to be found after media line m=video expected true got false  
### /webrtc/RTCPeerConnection-addTcpIceCandidate.html
- name: TCP candidate aimed at port 8001 accepted  
  message: promise_test: Unhandled rejection with value: undefined  
- name: TCP addIceCandidate aimed at port 8001 accepted  
  message: promise_test: Unhandled rejection with value: object "OperationError: Invalid sdpMid format"  

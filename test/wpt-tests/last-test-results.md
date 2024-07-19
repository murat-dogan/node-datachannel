
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
Running test: /webrtc/RTCConfiguration-bundlePolicy.html  
Running test: /webrtc/RTCConfiguration-iceCandidatePoolSize.html  
Running test: /webrtc/RTCConfiguration-iceServers.html  
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
Running test: /webrtc/RTCConfiguration-bundlePolicy.html  
Running test: /webrtc/RTCConfiguration-iceCandidatePoolSize.html  
Running test: /webrtc/RTCConfiguration-iceServers.html  
Running test: /webrtc/RTCPeerConnection-addIceCandidate.html  
Running test: /webrtc/RTCPeerConnection-addTcpIceCandidate.html  

# Tests Report
Total Tests [Chrome]:  237   
Total Tests [Library]:  237  (We expect this to be equal to Total Tests [Chrome])  
Passed Tests:  182   
Failed Tests (Chrome + Library):  31  (We don't care about these tests)  
Failed Tests:  24    

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
### /webrtc/RTCConfiguration-bundlePolicy.html
- name: Default bundlePolicy should be balanced  
  message: assert_equals: expected (string) "balanced" but got (undefined) undefined  
- name: new RTCPeerConnection({ bundlePolicy: undefined }) should have bundlePolicy balanced  
  message: assert_equals: expected (string) "balanced" but got (undefined) undefined  
- name: new RTCPeerConnection({ bundlePolicy: null }) should throw TypeError  
  message: assert_throws_js: function "() =>
      new RTCPeerConnection({ bundlePolicy: null })" did not throw  
- name: new RTCPeerConnection({ bundlePolicy: 'invalid' }) should throw TypeError  
  message: assert_throws_js: function "() =>
      new RTCPeerConnection({ bundlePolicy: 'invalid' })" did not throw  
- name: setConfiguration({ bundlePolicy: 'max-compat' }) with initial bundlePolicy max-bundle should throw InvalidModificationError  
  message: assert_throws_dom: function "() =>
      pc.setConfiguration({ bundlePolicy: 'max-compat' })" did not throw  
- name: setConfiguration({}) with initial bundlePolicy max-bundle should throw InvalidModificationError  
  message: assert_throws_dom: function "() =>
      pc.setConfiguration({})" did not throw  
### /webrtc/RTCConfiguration-iceCandidatePoolSize.html
- name: Initialize a new RTCPeerConnection with no iceCandidatePoolSize  
  message: assert_equals: expected (number) 0 but got (undefined) undefined  
- name: Initialize a new RTCPeerConnection with iceCandidatePoolSize: -1 (Out Of Range)  
  message: assert_throws_js: function "() => {
    new RTCPeerConnection({
      iceCandidatePoolSize: -1
    });
  }" did not throw  
- name: Initialize a new RTCPeerConnection with iceCandidatePoolSize: 256 (Out Of Range)  
  message: assert_throws_js: function "() => {
    new RTCPeerConnection({
      iceCandidatePoolSize: 256
    });
  }" did not throw  
- name: Reconfigure RTCPeerConnection instance iceCandidatePoolSize to -1 (Out Of Range)  
  message: assert_throws_js: function "() => {
    pc.setConfiguration({
      iceCandidatePoolSize: -1
    });
  }" did not throw  
- name: Reconfigure RTCPeerConnection instance iceCandidatePoolSize to 256 (Out Of Range)  
  message: assert_throws_js: function "() => {
    pc.setConfiguration({
      iceCandidatePoolSize: 256
    });
  }" did not throw  
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
- name: TCP candidate aimed at Fetch bad port 117 ignored  
  message: assert_unreached: Reached unreachable code  

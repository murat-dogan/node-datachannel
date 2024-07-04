# wpt Setup

git clone https://github.com/web-platform-tests/wpt.git
cd wpt
./wpt make-hosts-file | sudo tee -a /etc/hosts
./wpt serve

After your hosts file is configured, the servers will be locally accessible at:

http://web-platform.test:8000/
https://web-platform.test:8443/ \*

To use the web-based runner point your browser to:

http://web-platform.test:8000/tools/runner/index.html
https://web-platform.test:8443/tools/runner/index.html \*

# Run a test for Chrome

./wpt run chrome /webrtc/RTCPeerConnection-addIceCandidate.html

# More Info

https://github.com/web-platform-tests/wpt

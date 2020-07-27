# Examples

## client
 * You can use client example project to test WebRTC Data Channels with WebSocket signaling.
 * It uses same logic of [libdatachannel/examples/client](https://github.com/paullouisageneau/libdatachannel/tree/master/examples) project.

## web
* Copied from [libdatachannel/examples/web](https://github.com/paullouisageneau/libdatachannel/tree/master/examples)
* Contains an equivalent implementation for web browsers and a node.js signaling server

## How to Use?
* Start ws signaling server;
  * cd examples/web
  * npm i
  * node server.js
* Start answerer;
  * cd examples/client
  * npm i
  * node client.js
  * Note local ID
* Start Offerer;
  * cd examples/client
  * npm i
  * node client.js
  * Enter answerer ID
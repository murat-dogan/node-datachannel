# Build

## Requirements

- cmake >= V3.21
- [libdatachannel dependencies](https://github.com/paullouisageneau/libdatachannel/blob/master/README.md#dependencies)

## Building from source
 
 ```sh
 > git clone https://github.com/murat-dogan/node-datachannel.git
 > cd node-datachannel
 > npm install --ignore-scripts
 > npm run compile
 > npm run build:tsc
 ```
 
 ### Compile Options
 
 Compile without Media and WebSocket:
 
 ```sh
 npx cmake-js clean
 npx cmake-js configure --CDNO_MEDIA=ON --CDNO_WEBSOCKET=ON
 npx cmake-js build
 ```

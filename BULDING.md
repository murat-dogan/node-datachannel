# Build

## Requirements

- cmake >= V3.21
- [libdatachannel dependencies](https://github.com/paullouisageneau/libdatachannel/blob/master/README.md#dependencies)

## Building from source

```sh
> git clone https://github.com/murat-dogan/node-datachannel.git
> cd node-datachannel
> npm i
```

Other Options

```sh
# Use GnuTLS instead of OpenSSL (Default False)
> npm run install-gnu-tls

# Use libnice instead of libjuice (Default False)
# libnice-dev packet should be installed. (eg. sudo apt install libnice-dev)
> npm run install-nice
```

Compile without Media and Websocket

```sh
npx cmake-js clean
npx cmake-js configure --CDNO_MEDIA=ON --CDNO_WEBSOCKET=ON
npx cmake-js build
```

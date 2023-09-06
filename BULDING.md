# Build

## Requirements
* cmake >= V3.14
* [libdatachannel dependencies](https://github.com/paullouisageneau/libdatachannel/blob/master/README.md#dependencies)

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

## Building with Docker

`cd` into `node-datachannel` root directory

```sh
# Build Docker image from Dockerfile
# You can choose Ubuntu and Node major versions by changing UBUNTU_VERSION and NODE_MAJOR
> docker build \
    -t node-datachannel-dev \
    --build-arg UBUNTU_VERSION=20.04 \
    --build-arg NODE_MAJOR=18 \
    .

# Run Docker container and mount node-datachannel root directory as a volume to the container
> docker run -it --rm --name node-datachannel-dev-container -v ${PWD}:/home/node-datachannel node-datachannel-dev /bin/bash

# Run inside Docker container:
> npm install --build-from-source
```

The build will be written to `prebuilds/`

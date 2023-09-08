# Examples

## Building with Docker

`cd` into `node-datachannel` root directory

```sh
# Build Docker image from Dockerfile
# You can choose Ubuntu and Node major versions by changing UBUNTU_VERSION and NODE_MAJOR
> docker build \
    -f ./examples/build/Dockerfile \
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

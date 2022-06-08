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
> npm run install -- -DUSE_GNUTLS=1  # Use GnuTLS instead of OpenSSL (Default False)
> npm run install -- -DUSE_NICE=1    # Use libnice instead of libjuice (Default False)
```
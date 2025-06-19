set(CMAKE_SYSTEM_NAME Linux)
set(triple $ENV{TRIPLE})

# use clang and lld
set(CMAKE_C_COMPILER $ENV{GCC})
set(CMAKE_CXX_COMPILER $ENV{GXX})
if (CMAKE_C_COMPILER MATCHES clang)
    add_link_options("-fuse-ld=lld")
endif()

set(CMAKE_SYSROOT "$ENV{SYSROOT}")
message(STATUS "Using sysroot: ${CMAKE_SYSROOT}")

set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)

set(CMAKE_C_COMPILER_TARGET ${triple})
set(CMAKE_CXX_COMPILER_TARGET ${triple})
message(STATUS "Compiling for: ${triple}")

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} $ENV{COMPILER_FLAGS}")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} $ENV{COMPILER_FLAGS}")

if(triple MATCHES "aarch64-.*-gnu")
    # ARM64 cross-compilation
    set(CMAKE_FIND_ROOT_PATH /usr/aarch64-linux-gnu)
    set(OPENSSL_ROOT_DIR /usr)
    set(OPENSSL_CRYPTO_LIBRARY /usr/lib/aarch64-linux-gnu/libcrypto.so)
    set(OPENSSL_SSL_LIBRARY /usr/lib/aarch64-linux-gnu/libssl.so)
    set(OPENSSL_INCLUDE_DIR /usr/include)
    message(STATUS "Setting OpenSSL paths for ARM64 cross-compilation")
elseif(triple MATCHES "arm-.*-gnueabihf")
    # ARM cross-compilation
    set(CMAKE_FIND_ROOT_PATH /usr/arm-linux-gnueabihf)
    set(OPENSSL_ROOT_DIR /usr)
    set(OPENSSL_CRYPTO_LIBRARY /usr/lib/arm-linux-gnueabihf/libcrypto.so)
    set(OPENSSL_SSL_LIBRARY /usr/lib/arm-linux-gnueabihf/libssl.so)
    set(OPENSSL_INCLUDE_DIR /usr/include)
    message(STATUS "Setting OpenSSL paths for ARM cross-compilation")
else()
    # Native compilation (amd64) or other architectures
    message(STATUS "Using native OpenSSL detection for ${triple}")
endif()

# Debug OpenSSL paths
message(STATUS "OPENSSL_ROOT_DIR: ${OPENSSL_ROOT_DIR}")
message(STATUS "OPENSSL_CRYPTO_LIBRARY: ${OPENSSL_CRYPTO_LIBRARY}")
message(STATUS "OPENSSL_SSL_LIBRARY: ${OPENSSL_SSL_LIBRARY}")
message(STATUS "OPENSSL_INCLUDE_DIR: ${OPENSSL_INCLUDE_DIR}")
cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0091 NEW)
project(node_datachannel VERSION 0.1.10)

include_directories(${CMAKE_JS_INC})

set(CMAKE_BUILD_TYPE Release)

if(WIN32)
    set(OPENSSL_MSVC_STATIC_RT TRUE)
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
endif()

# Got linker error for arm64
# /usr/lib/gcc-cross/aarch64-linux-gnu/9/../../../../aarch64-linux-gnu/bin/ld: ../sysroot/usr/lib/aarch64-linux-gnu/libcrypto.a(sha1-armv8.o): relocation R_AARCH64_PREL64 against symbol `OPENSSL_armcap_P' which may bind externally can not be used when making a shared object; recompile with -fPIC
# ../sysroot/usr/lib/aarch64-linux-gnu/libcrypto.a(sha1-armv8.o): in function `sha1_block_armv8':
# (.text+0x1240): dangerous relocation: unsupported relocation
if(NOT ${NODE_ARCH} STREQUAL "arm64")
  set(OPENSSL_USE_STATIC_LIBS TRUE)
  find_package(OpenSSL REQUIRED)
endif()


include(FetchContent)

# Fetch libdatachannel
FetchContent_Declare(
    libdatachannel
    GIT_REPOSITORY https://github.com/paullouisageneau/libdatachannel.git
    GIT_TAG "v0.15.2"
)

FetchContent_GetProperties(libdatachannel)
if(NOT libdatachannel)
  FetchContent_Populate(libdatachannel)
  add_subdirectory(${libdatachannel_SOURCE_DIR} ${libdatachannel_BINARY_DIR} EXCLUDE_FROM_ALL)
endif()


add_library(${PROJECT_NAME} SHARED
    src/rtc-wrapper.cpp
    src/data-channel-wrapper.cpp
    src/peer-connection-wrapper.cpp
    src/main.cpp
    ${CMAKE_JS_SRC}
)

set_target_properties(${PROJECT_NAME} PROPERTIES CXX_STANDARD 17)
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_SOURCE_DIR}/node_modules/node-addon-api
    ${CMAKE_SOURCE_DIR}/node_modules/napi-thread-safe-callback
    ${CMAKE_BINARY_DIR}/_deps/libdatachannel-src/include
)

set(LINK_LIBRARIES
    ${CMAKE_JS_LIB}
    datachannel-static
)

if(APPLE)
  ###
elseif(UNIX)
    list(APPEND LINK_LIBRARIES -static-libgcc -static-libstdc++)
endif()

if(WIN32)
    SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /MT")
    list(APPEND LINK_LIBRARIES crypt32.lib)
endif()

target_link_libraries(${PROJECT_NAME} PRIVATE ${LINK_LIBRARIES})

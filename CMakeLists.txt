cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0091 NEW)
cmake_policy(SET CMP0042 NEW)

project(node_datachannel VERSION 0.29.0)

# compile_commands.json
# -----------------------------------
set(CMAKE_EXPORT_COMPILE_COMMANDS True)

# -Dnapi_build_version=8
add_definitions(-DNAPI_VERSION=8)

include_directories(${CMAKE_JS_INC})

if(WIN32)
    set(OPENSSL_MSVC_STATIC_RT TRUE)
    set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
endif()

if(CMAKE_HOST_SYSTEM_NAME STREQUAL "Android")
    set(CMAKE_C_FLAGS "-Wno-error=unused-but-set-variable -Wno-error=strict-prototypes")
endif()

# Add -frtti only for Linux and macOS
if (NOT CMAKE_SYSTEM_NAME STREQUAL "Windows")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -frtti")
endif()

set(OPENSSL_USE_STATIC_LIBS TRUE)
find_package(OpenSSL REQUIRED)

include(FetchContent)

# Fetch libdatachannel
FetchContent_Declare(
    libdatachannel
    GIT_REPOSITORY https://github.com/paullouisageneau/libdatachannel.git
    GIT_TAG "v0.23.0"
)

option(NO_MEDIA "Disable media transport support in libdatachannel" OFF)
option(NO_WEBSOCKET "Disable WebSocket support in libdatachannel" OFF)

set(FETCHCONTENT_QUIET OFF)
FetchContent_GetProperties(libdatachannel)

if(NOT libdatachannel)
    FetchContent_Populate(libdatachannel)
    add_subdirectory(${libdatachannel_SOURCE_DIR} ${libdatachannel_BINARY_DIR} EXCLUDE_FROM_ALL)
endif()

# Create Source File List
set(SRC_FILES
   src/cpp/rtc-wrapper.cpp
    src/cpp/data-channel-wrapper.cpp
    src/cpp/ice-udp-mux-listener-wrapper.cpp
    src/cpp/peer-connection-wrapper.cpp
    src/cpp/thread-safe-callback.cpp
    src/cpp/main.cpp
    ${CMAKE_JS_SRC}
)

if(NOT NO_MEDIA)
    list(APPEND SRC_FILES
        src/cpp/media-direction.cpp
        src/cpp/media-rtcpreceivingsession-wrapper.cpp
        src/cpp/media-track-wrapper.cpp
        src/cpp/media-audio-wrapper.cpp
        src/cpp/media-video-wrapper.cpp
    )
endif()

if(NOT NO_WEBSOCKET)
    list(APPEND SRC_FILES
        src/cpp/web-socket-wrapper.cpp
        src/cpp/web-socket-server-wrapper.cpp
    )
endif()

add_library(${PROJECT_NAME} SHARED ${SRC_FILES})

set_target_properties(${PROJECT_NAME} PROPERTIES CXX_STANDARD 17)
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

# Set the output directory for all build types
# set_target_properties(${PROJECT_NAME} PROPERTIES
#     RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/binary
#     LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/binary
#     ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/binary
# )

target_include_directories(${PROJECT_NAME} PRIVATE
    ${CMAKE_SOURCE_DIR}/node_modules/node-addon-api
    ${CMAKE_BINARY_DIR}/_deps/libdatachannel-src/include
    ${CMAKE_BINARY_DIR}/_deps/libdatachannel-src/deps/plog
)

set(LINK_LIBRARIES
    ${CMAKE_JS_LIB}
    datachannel-static
    plog::plog
)

if(APPLE)
#
elseif(CMAKE_HOST_SYSTEM_NAME STREQUAL "Android")
    list(APPEND LINK_LIBRARIES -static-libgcc)
elseif(UNIX)
    list(APPEND LINK_LIBRARIES -static-libgcc -static-libstdc++)
endif()

if(WIN32)
    SET(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /MT")
    list(APPEND LINK_LIBRARIES crypt32.lib)
endif()

target_link_libraries(${PROJECT_NAME} PRIVATE ${LINK_LIBRARIES})

if(MSVC AND CMAKE_JS_NODELIB_DEF AND CMAKE_JS_NODELIB_TARGET)
  # Generate node.lib
  execute_process(COMMAND ${CMAKE_AR} /def:${CMAKE_JS_NODELIB_DEF} /out:${CMAKE_JS_NODELIB_TARGET} ${CMAKE_STATIC_LINKER_FLAGS})
endif()

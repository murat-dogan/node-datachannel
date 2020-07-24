cmake_minimum_required(VERSION 3.1)
project(node_datachannel VERSION 0.0.1)
    
include(NodeJS.cmake)
nodejs_init()

set(CMAKE_BUILD_TYPE Release)

include(FetchContent)

# Fetch libdatachannel
FetchContent_Declare(
    libdatachannel
    GIT_REPOSITORY https://github.com/paullouisageneau/libdatachannel.git
    GIT_TAG        "v0.7.0"
)
FetchContent_MakeAvailable(libdatachannel)

add_nodejs_module(${PROJECT_NAME} 
    src/rtc-wrapper.cpp
    src/data-channel-wrapper.cpp
    src/peer-connection-wrapper.cpp
    src/main.cpp
)

set_target_properties(${PROJECT_NAME} PROPERTIES CXX_STANDARD 17)

target_include_directories(${PROJECT_NAME} PRIVATE 
    ${CMAKE_SOURCE_DIR}/node_modules/node-addon-api 
    ${CMAKE_SOURCE_DIR}/node_modules/napi-thread-safe-callback 
    ${CMAKE_BINARY_DIR}/_deps/libdatachannel-src/include
)

target_link_libraries(${PROJECT_NAME} PRIVATE 
    datachannel-static
)    

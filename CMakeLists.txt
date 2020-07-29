cmake_minimum_required(VERSION 3.1)
project(node_datachannel VERSION 0.0.7)
    
include_directories(${CMAKE_JS_INC})

set(CMAKE_BUILD_TYPE Release)

include(FetchContent)

# Fetch libdatachannel
FetchContent_Declare(
    libdatachannel
    GIT_REPOSITORY https://github.com/paullouisageneau/libdatachannel.git
    GIT_TAG        "aac9b101d8b61fa0ab20f27b6fa44f8ba94b29b0"
)
FetchContent_MakeAvailable(libdatachannel)

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

target_link_libraries(${PROJECT_NAME} PRIVATE 
    ${CMAKE_JS_LIB}
    datachannel-static
)    

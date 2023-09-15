set(CMAKE_SYSTEM_NAME Linux)
set(TOOLCHAIN_PREFIX aarch64-linux-gnu)

# cross compilers to use for C and C++
set(CMAKE_C_COMPILER ${TOOLCHAIN_PREFIX}-gcc)
set(CMAKE_CXX_COMPILER ${TOOLCHAIN_PREFIX}-g++)

# Needed sysroot
# https://github.com/webrtc-uwp/chromium-build/blob/master/linux/sysroot_scripts/sysroots.json
set(CMAKE_SYSROOT "$ENV{ARM64_SYSROOT}")

set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)

set(CMAKE_C_FLAGS "-march=armv8-a -fPIC -Wno-error=format-truncation" CACHE STRING "Compiler Flags")
set(CMAKE_CXX_FLAGS "${CMAKE_C_FLAGS}" CACHE STRING "Compiler Flags")

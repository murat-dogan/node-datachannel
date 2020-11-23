set(CMAKE_SYSTEM_NAME Linux)
set(TOOLCHAIN_PREFIX arm-linux-gnueabihf)

# cross compilers to use for C and C++
set(CMAKE_C_COMPILER ${TOOLCHAIN_PREFIX}-gcc)
set(CMAKE_CXX_COMPILER ${TOOLCHAIN_PREFIX}-g++)

# Needed sysroot
# https://github.com/webrtc-uwp/chromium-build/blob/master/linux/sysroot_scripts/sysroots.json
set(CMAKE_SYSROOT "$ENV{ARM_SYSROOT}")

set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
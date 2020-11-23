set(CMAKE_SYSTEM_NAME Linux)
set(TOOLCHAIN_PREFIX arm-linux-gnueabihf)

# cross compilers to use for C and C++
set(CMAKE_C_COMPILER ${TOOLCHAIN_PREFIX}-gcc)
set(CMAKE_CXX_COMPILER ${TOOLCHAIN_PREFIX}-g++)

# Needed sysroot
# https://github.com/webrtc-uwp/chromium-build/blob/master/linux/sysroot_scripts/sysroots.json
set(CMAKE_SYSROOT /home/runner/work/node-datachannel/node-datachannel/sysroot)

SET(CMAKE_FIND_ROOT_PATH ${CMAKE_SYSROOT})
SET(CMAKE_LIBRARY_PATH "${CMAKE_SYSROOT}/lib/arm-linux-gnueabihf ${CMAKE_SYSROOT}/usr/lib/arm-linux-gnueabihf")
SET(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} --sysroot=${CMAKE_SYSROOT}")
SET(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} --sysroot=${CMAKE_SYSROOT}")
SET(CMAKE_MODULE_LINKER_FLAGS "${CMAKE_MODULE_LINKER_FLAGS} --sysroot=${CMAKE_SYSROOT}")

set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
#ifndef MEDIA_MEDIAHANDLER_HELPER_H
#define MEDIA_MEDIAHANDLER_HELPER_H

#include <memory>

#include <napi.h>
#include <rtc/rtc.hpp>

std::shared_ptr<rtc::MediaHandler> asMediaHandler(const Napi::Object &obj);

#endif // MEDIA_MEDIAHANDLER_HELPER_H

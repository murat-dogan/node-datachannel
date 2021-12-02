#ifndef RTC_WRAPPER_H
#define RTC_WRAPPER_H

#include <iostream>
#include <string>

#include <napi.h>

#include "rtc/rtc.hpp"

class RtcWrapper
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    static void preload(const Napi::CallbackInfo &info);
    static void initLogger(const Napi::CallbackInfo &info);
    static void cleanup(const Napi::CallbackInfo &info);
    static void setSctpSettings(const Napi::CallbackInfo &info);
};

#endif // RTC_WRAPPER_H

#include "rtc-wrapper.h"

Napi::Object RtcWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    exports.Set("initLogger", Napi::Function::New(env, &RtcWrapper::initLogger));
    exports.Set("cleanup", Napi::Function::New(env, &RtcWrapper::cleanup));
    exports.Set("preload", Napi::Function::New(env, &RtcWrapper::preload));

    return exports;
}

void RtcWrapper::preload(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    try
    {
        rtc::Preload();
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
    }
}

void RtcWrapper::initLogger(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    // We expect (String, Object, Function) as param
    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "LogLevel(String) expected").ThrowAsJavaScriptException();
        return;
    }

    std::string logLevelStr = info[0].As<Napi::String>().ToString();
    rtc::LogLevel logLevel = rtc::LogLevel::None;

    if (logLevelStr == "Verbose")
        logLevel = rtc::LogLevel::Verbose;
    if (logLevelStr == "Debug")
        logLevel = rtc::LogLevel::Debug;
    if (logLevelStr == "Info")
        logLevel = rtc::LogLevel::Info;
    if (logLevelStr == "Warning")
        logLevel = rtc::LogLevel::Warning;
    if (logLevelStr == "Error")
        logLevel = rtc::LogLevel::Error;
    if (logLevelStr == "Fatal")
        logLevel = rtc::LogLevel::Fatal;

    try
    {
        rtc::InitLogger(logLevel);
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

void RtcWrapper::cleanup(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    try
    {
        rtc::Cleanup();
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}
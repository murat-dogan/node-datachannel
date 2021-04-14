#include "rtc-wrapper.h"

Napi::Object RtcWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    exports.Set("initLogger", Napi::Function::New(env, &RtcWrapper::initLogger));
    exports.Set("cleanup", Napi::Function::New(env, &RtcWrapper::cleanup));
    exports.Set("preload", Napi::Function::New(env, &RtcWrapper::preload));
    exports.Set("setSctpSettings", Napi::Function::New(env, &RtcWrapper::setSctpSettings));

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

void RtcWrapper::setSctpSettings(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    // We expect (Object) as param
    if (length < 1 || !info[0].IsObject())
    {
        Napi::TypeError::New(env, "Configuration (Object) expected").ThrowAsJavaScriptException();
        return;
    }

    rtc::SctpSettings settings;
    Napi::Object config = info[0].As<Napi::Object>();

    if (config.Get("recvBufferSize").IsNumber())
        settings.recvBufferSize = static_cast<uint16_t>(config.Get("recvBufferSize").As<Napi::Number>().Uint32Value());
    if (config.Get("sendBufferSize").IsNumber())
        settings.sendBufferSize = static_cast<uint16_t>(config.Get("sendBufferSize").As<Napi::Number>().Uint32Value());
    if (config.Get("maxChunksOnQueue").IsNumber())
        settings.maxChunksOnQueue = static_cast<uint16_t>(config.Get("maxChunksOnQueue").As<Napi::Number>().Uint32Value());
    if (config.Get("initialCongestionWindow").IsNumber())
        settings.initialCongestionWindow = static_cast<uint16_t>(config.Get("initialCongestionWindow").As<Napi::Number>().Uint32Value());
    if (config.Get("congestionControlModule").IsNumber())
        settings.congestionControlModule = static_cast<uint16_t>(config.Get("congestionControlModule").As<Napi::Number>().Uint32Value());
    if (config.Get("delayedSackTime").IsNumber())
        settings.delayedSackTime = std::chrono::milliseconds(config.Get("delayedSackTime").As<Napi::Number>().Uint32Value());

    rtc::SetSctpSettings(settings);
}
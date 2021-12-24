#include "rtc-wrapper.h"
#include "peer-connection-wrapper.h"
#include "data-channel-wrapper.h"
#include "media-track-wrapper.h"

#include <chrono>
#include <future>

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
        PeerConnectionWrapper::CloseAll();
        DataChannelWrapper::CloseAll();
        TrackWrapper::CloseAll();

        const auto timeout = std::chrono::seconds(10);
        if(rtc::Cleanup().wait_for(std::chrono::seconds(timeout)) == std::future_status::timeout)
            throw std::runtime_error("cleanup timeout (possible deadlock)");
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
        settings.recvBufferSize = config.Get("recvBufferSize").As<Napi::Number>().Uint32Value();
    if (config.Get("sendBufferSize").IsNumber())
        settings.sendBufferSize = config.Get("sendBufferSize").As<Napi::Number>().Uint32Value();
    if (config.Get("maxChunksOnQueue").IsNumber())
        settings.maxChunksOnQueue = config.Get("maxChunksOnQueue").As<Napi::Number>().Uint32Value();
    if (config.Get("initialCongestionWindow").IsNumber())
        settings.initialCongestionWindow = config.Get("initialCongestionWindow").As<Napi::Number>().Uint32Value();
    if (config.Get("congestionControlModule").IsNumber())
        settings.congestionControlModule = config.Get("congestionControlModule").As<Napi::Number>().Uint32Value();
    if (config.Get("delayedSackTime").IsNumber())
        settings.delayedSackTime = std::chrono::milliseconds(config.Get("delayedSackTime").As<Napi::Number>().Uint32Value());

    rtc::SetSctpSettings(settings);
}

#include "rtc-wrapper.h"

Napi::Object RtcWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    exports.Set("initLogger", Napi::Function::New(env, &RtcWrapper::initLogger));
    return exports;
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

    rtc::InitLogger(logLevel);
}
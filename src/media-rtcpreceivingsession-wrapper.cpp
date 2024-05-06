#include "media-rtcpreceivingsession-wrapper.h"

Napi::FunctionReference RtcpReceivingSessionWrapper::constructor;
std::unordered_set<RtcpReceivingSessionWrapper *> RtcpReceivingSessionWrapper::instances;

Napi::Object RtcpReceivingSessionWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = Napi::ObjectWrap<RtcpReceivingSessionWrapper>::DefineClass(
        env,
        "RtcpReceivingSession",
        {
            Napi::ObjectWrap<RtcpReceivingSessionWrapper>::InstanceMethod("requestBitrate", &RtcpReceivingSessionWrapper::requestBitrate),
            Napi::ObjectWrap<RtcpReceivingSessionWrapper>::InstanceMethod("requestKeyframe", &RtcpReceivingSessionWrapper::requestKeyframe),
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("RtcpReceivingSession", func);
    return exports;
}

RtcpReceivingSessionWrapper::RtcpReceivingSessionWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<RtcpReceivingSessionWrapper>(info)
{
    Napi::Env env = info.Env();
    mSessionPtr = std::make_unique<rtc::RtcpReceivingSession>();
    instances.insert(this);
}

RtcpReceivingSessionWrapper::~RtcpReceivingSessionWrapper()
{
    mSessionPtr.reset();
    instances.erase(this);
}

std::shared_ptr<rtc::RtcpReceivingSession> RtcpReceivingSessionWrapper::getSessionInstance()
{
    return mSessionPtr;
}

void RtcpReceivingSessionWrapper::requestBitrate(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    unsigned int bitrate = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());
    mSessionPtr->requestBitrate(bitrate);
}

Napi::Value RtcpReceivingSessionWrapper::requestKeyframe(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, mSessionPtr->requestKeyframe());
}

#include "media-video-wrapper.h"

Napi::FunctionReference VideoWrapper::constructor;
std::unordered_set<VideoWrapper *> VideoWrapper::instances;

Napi::Object VideoWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "Video",
        {InstanceMethod("addH264Codec", &VideoWrapper::addH264Codec),
         InstanceMethod("addVideoCodec", &VideoWrapper::addVideoCodec),
         InstanceMethod("addVP8Codec", &VideoWrapper::addVP8Codec),
         InstanceMethod("addVP9Codec", &VideoWrapper::addVP9Codec)});

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Video", func);
    return exports;
}

VideoWrapper::VideoWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<VideoWrapper>(info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    std::string mid = "video";
    rtc::Description::Direction dir = rtc::Description::Direction::SendOnly;

    // optional
    if (length > 1)
    {
        if (!info[0].IsString())
        {
            Napi::TypeError::New(env, "mid (String) expected").ThrowAsJavaScriptException();
            return;
        }
        mid = info[0].As<Napi::String>().ToString();
    }

    // ootional
    if (length > 2)
    {
        if (!info[0].IsNumber())
        {
            Napi::TypeError::New(env, "direction (Number) expected").ThrowAsJavaScriptException();
            return;
        }

        switch (static_cast<unsigned int>(info[0].As<Napi::Number>().ToNumber()))
        {
        case 0:
            dir = rtc::Description::Direction::Unknown;
            break;
        case 1:
            dir = rtc::Description::Direction::SendOnly;
            break;
        case 2:
            dir = rtc::Description::Direction::RecvOnly;
            break;
        case 3:
            dir = rtc::Description::Direction::SendRecv;
            break;
        case 4:
            dir = rtc::Description::Direction::Unknown;
            break;
        default:
            Napi::TypeError::New(env, "direction must be between [0,4]").ThrowAsJavaScriptException();
            return;
        }
    }

    mVideoPtr = std::make_unique<rtc::Description::Video>(mid, dir);

    instances.insert(this);
}

VideoWrapper::~VideoWrapper()
{
}

void VideoWrapper::addVideoCodec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 2 || !info[0].IsNumber() || !info[1].IsString())
    {
        Napi::TypeError::New(env, "We expect (Number, String, String[optional]) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();
    std::string codec = info[1].As<Napi::String>().ToString();
    std::optional<std::string> profile = std::nullopt;

    if (length > 2)
    {
        if (!info[0].IsString())
        {
            Napi::TypeError::New(env, "profile (String) expected").ThrowAsJavaScriptException();
            return;
        }
        profile = info[2].As<Napi::String>().ToString();
    }

    mVideoPtr->addVideoCodec(payloadType, codec, profile);
}

void VideoWrapper::addH264Codec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();
    std::optional<std::string> profile = rtc::DEFAULT_H264_VIDEO_PROFILE;

    if (length > 1)
    {
        if (!info[0].IsString())
        {
            Napi::TypeError::New(env, "profile (String) expected").ThrowAsJavaScriptException();
            return;
        }
        profile = info[1].As<Napi::String>().ToString();
    }

    mVideoPtr->addH264Codec(payloadType, profile);
}

void VideoWrapper::addVP8Codec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();

    mVideoPtr->addVP8Codec(payloadType);
}

void VideoWrapper::addVP9Codec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();

    mVideoPtr->addVP9Codec(payloadType);
}

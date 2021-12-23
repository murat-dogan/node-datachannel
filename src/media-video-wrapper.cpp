#include "media-video-wrapper.h"
#include "media-direction.h"

Napi::FunctionReference VideoWrapper::constructor;
std::unordered_set<VideoWrapper *> VideoWrapper::instances;

Napi::Object VideoWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = Napi::ObjectWrap<VideoWrapper>::DefineClass(
        env,
        "Video",
        {
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("addH264Codec", &VideoWrapper::addH264Codec),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("addVideoCodec", &VideoWrapper::addVideoCodec),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("addVP8Codec", &VideoWrapper::addVP8Codec),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("addVP9Codec", &VideoWrapper::addVP9Codec),

            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("direction", &VideoWrapper::direction),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("generateSdp", &VideoWrapper::generateSdp),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("mid", &VideoWrapper::mid),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("setDirection", &VideoWrapper::setDirection),

            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("description", &VideoWrapper::description),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("removeFormat", &VideoWrapper::removeFormat),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("addSSRC", &VideoWrapper::addSSRC),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("removeSSRC", &VideoWrapper::removeSSRC),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("replaceSSRC", &VideoWrapper::replaceSSRC),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("hasSSRC", &VideoWrapper::hasSSRC),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("getSSRCs", &VideoWrapper::getSSRCs),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("getCNameForSsrc", &VideoWrapper::getCNameForSsrc),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("setBitrate", &VideoWrapper::setBitrate),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("getBitrate", &VideoWrapper::getBitrate),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("hasPayloadType", &VideoWrapper::hasPayloadType),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("addRTXCodec", &VideoWrapper::addRTXCodec),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("addRTPMap", &VideoWrapper::addRTPMap),
            Napi::ObjectWrap<VideoWrapper>::InstanceMethod("parseSdpLine", &VideoWrapper::parseSdpLine),
        });

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
    rtc::Description::Direction dir = rtc::Description::Direction::Unknown;

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
        if (!info[1].IsString())
        {
            Napi::TypeError::New(env, "direction (String) expected").ThrowAsJavaScriptException();
            return;
        }

        std::string dirAsStr = info[1].As<Napi::String>().ToString();
        dir = strToDirection(dirAsStr);
    }

    mVideoPtr = std::make_unique<rtc::Description::Video>(mid, dir);

    instances.insert(this);
}

VideoWrapper::~VideoWrapper()
{
    mVideoPtr.reset();
    instances.erase(this);
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

Napi::Value VideoWrapper::direction(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, directionToStr(mVideoPtr->direction()));
}

Napi::Value VideoWrapper::generateSdp(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 3 || !info[0].IsString() || !info[1].IsString() || !info[2].IsString())
    {
        Napi::TypeError::New(env, "We expect (String, String, String) as param").ThrowAsJavaScriptException();
        return Napi::String::New(env, "");
    }

    std::string eol = info[0].As<Napi::String>().ToString();
    std::string addr = info[1].As<Napi::String>().ToString();
    std::string port = info[2].As<Napi::String>().ToString();

    return Napi::String::New(env, mVideoPtr->generateSdp(eol, addr, port));
}

Napi::Value VideoWrapper::mid(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, mVideoPtr->mid());
}

void VideoWrapper::setDirection(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "We expect (String) as param").ThrowAsJavaScriptException();
        return;
    }

    std::string dirAsStr = info[0].As<Napi::String>().ToString();
    rtc::Description::Direction dir = strToDirection(dirAsStr);
    mVideoPtr->setDirection(dir);
}

Napi::Value VideoWrapper::description(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, mVideoPtr->description());
}

void VideoWrapper::removeFormat(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "We expect (String) as param").ThrowAsJavaScriptException();
        return;
    }

    std::string fmt = info[0].As<Napi::String>().ToString();

    mVideoPtr->removeFormat(fmt);
}

void VideoWrapper::addSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number, String[optional], String[optional], String[optional]) as param").ThrowAsJavaScriptException();
        return;
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());
    std::optional<std::string> name;
    std::optional<std::string> msid = std::nullopt;
    std::optional<std::string> trackID = std::nullopt;

    if (length > 1)
    {
        if (!info[1].IsString())
        {
            Napi::TypeError::New(env, "name as String expected").ThrowAsJavaScriptException();
            return;
        }
        name = info[1].As<Napi::String>().ToString();
    }

    if (length > 2)
    {
        if (!info[2].IsString())
        {
            Napi::TypeError::New(env, "msid as String expected").ThrowAsJavaScriptException();
            return;
        }
        msid = info[2].As<Napi::String>().ToString();
    }

    if (length > 3)
    {
        if (!info[3].IsString())
        {
            Napi::TypeError::New(env, "trackID as String expected").ThrowAsJavaScriptException();
            return;
        }
        trackID = info[3].As<Napi::String>().ToString();
    }

    mVideoPtr->addSSRC(ssrc, name, msid, trackID);
}

void VideoWrapper::removeSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());

    mVideoPtr->removeSSRC(ssrc);
}

void VideoWrapper::replaceSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 2 || !info[0].IsNumber() || !info[1].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number, Number, String[optional], String[optional], String[optional]) as param").ThrowAsJavaScriptException();
        return;
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());
    uint32_t oldSsrc = static_cast<uint32_t>(info[1].As<Napi::Number>().ToNumber());
    std::optional<std::string> name;
    std::optional<std::string> msid = std::nullopt;
    std::optional<std::string> trackID = std::nullopt;

    if (length > 2)
    {
        if (!info[2].IsString())
        {
            Napi::TypeError::New(env, "name as String expected").ThrowAsJavaScriptException();
            return;
        }
        name = info[2].As<Napi::String>().ToString();
    }

    if (length > 3)
    {
        if (!info[3].IsString())
        {
            Napi::TypeError::New(env, "msid as String expected").ThrowAsJavaScriptException();
            return;
        }
        msid = info[3].As<Napi::String>().ToString();
    }

    if (length > 4)
    {
        if (!info[4].IsString())
        {
            Napi::TypeError::New(env, "trackID as String expected").ThrowAsJavaScriptException();
            return;
        }
        trackID = info[4].As<Napi::String>().ToString();
    }

    mVideoPtr->replaceSSRC(oldSsrc, ssrc, name, msid, trackID);
}

Napi::Value VideoWrapper::hasSSRC(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return env.Null();
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());

    return Napi::Boolean::New(env, mVideoPtr->hasSSRC(ssrc));
}

Napi::Value VideoWrapper::getSSRCs(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    auto list = mVideoPtr->getSSRCs();

    Napi::Uint32Array napiArr = Napi::Uint32Array::New(env, list.size());
    for (size_t i = 0; i < list.size(); i++)
        napiArr[i] = list[i];

    return napiArr;
}

Napi::Value VideoWrapper::getCNameForSsrc(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return env.Null();
    }

    uint32_t ssrc = static_cast<uint32_t>(info[0].As<Napi::Number>().ToNumber());

    std::optional<std::string> name = mVideoPtr->getCNameForSsrc(ssrc);

    if (!name.has_value())
        return env.Null();

    return Napi::String::New(env, name.value());
}

void VideoWrapper::setBitrate(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int bitRate = static_cast<int>(info[0].As<Napi::Number>().ToNumber());

    mVideoPtr->setBitrate(bitRate);
}

Napi::Value VideoWrapper::getBitrate(const Napi::CallbackInfo &info)
{

    return Napi::Number::New(info.Env(), mVideoPtr->getBitrate());
}

Napi::Value VideoWrapper::hasPayloadType(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return env.Null();
    }

    int payloadType = static_cast<int>(info[0].As<Napi::Number>().ToNumber());

    return Napi::Boolean::New(env, mVideoPtr->hasPayloadType(payloadType));
}

void VideoWrapper::addRTXCodec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 3 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number,Number,Number) as param").ThrowAsJavaScriptException();
        return;
    }

    unsigned int payloadType = static_cast<unsigned int>(info[0].As<Napi::Number>().ToNumber());
    unsigned int originalPayloadType = static_cast<unsigned int>(info[1].As<Napi::Number>().ToNumber());
    unsigned int clockRate = static_cast<unsigned int>(info[2].As<Napi::Number>().ToNumber());

    mVideoPtr->addRTXCodec(payloadType, originalPayloadType, clockRate);
}

void VideoWrapper::addRTPMap(const Napi::CallbackInfo &info)
{
    // mVideoPtr->addRTPMap()
}

void VideoWrapper::parseSdpLine(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "We expect (String) as param").ThrowAsJavaScriptException();
        return;
    }

    std::string line = info[0].As<Napi::String>().ToString();

    mVideoPtr->parseSdpLine(line);
}

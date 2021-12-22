#include "media-audio-wrapper.h"

Napi::FunctionReference AudioWrapper::constructor;
std::unordered_set<AudioWrapper *> AudioWrapper::instances;

Napi::Object AudioWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "Audio",
        {InstanceMethod("addAudioCodec", &AudioWrapper::addAudioCodec),
         InstanceMethod("addOpusCodec", &AudioWrapper::addOpusCodec)});

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Audio", func);
    return exports;
}

AudioWrapper::AudioWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<AudioWrapper>(info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    std::string mid = "audio";
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

    mAudioPtr = std::make_unique<rtc::Description::Audio>(mid, dir);

    instances.insert(this);
}

AudioWrapper::~AudioWrapper()
{
}

void AudioWrapper::addAudioCodec(const Napi::CallbackInfo &info)
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

    mAudioPtr->addAudioCodec(payloadType, codec, profile);
}

void AudioWrapper::addOpusCodec(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "We expect (Number) as param").ThrowAsJavaScriptException();
        return;
    }

    int payloadType = info[0].As<Napi::Number>().ToNumber();
    std::optional<std::string> profile = rtc::DEFAULT_OPUS_AUDIO_PROFILE;

    if (length > 1)
    {
        if (!info[0].IsString())
        {
            Napi::TypeError::New(env, "profile (String) expected").ThrowAsJavaScriptException();
            return;
        }
        profile = info[1].As<Napi::String>().ToString();
    }

    mAudioPtr->addOpusCodec(payloadType, profile);
}

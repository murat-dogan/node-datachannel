#include "media-av1rtppacketizer-wrapper.h"
#include "media-av1packetization.h"
#include "media-rtppacketizationconfig-wrapper.h"
#include "media-mediahandler-helper.h"

Napi::FunctionReference AV1RtpPacketizerWrapper::constructor = Napi::FunctionReference();
std::unordered_set<AV1RtpPacketizerWrapper *> AV1RtpPacketizerWrapper::instances;

Napi::Object AV1RtpPacketizerWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<AV1RtpPacketizerWrapper>::DefineClass(env, "AV1RtpPacketizer",
    {
      // Instance Methods
      InstanceMethod("addToChain", &AV1RtpPacketizerWrapper::addToChain)
    });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("AV1RtpPacketizer", func);
  return exports;
}

AV1RtpPacketizerWrapper::AV1RtpPacketizerWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<AV1RtpPacketizerWrapper>(info)
{
  Napi::Env env = info.Env();

  if (info.Length() < 2)
  {
    Napi::Error::New(env, "Expected 2 or 3 parameters").ThrowAsJavaScriptException();
    return;
  }

  if (!info[0].IsString())
  {
    Napi::TypeError::New(env, "packetization must be \"Obu\" or \"TemporalUnit\"")
      .ThrowAsJavaScriptException();
    return;
  }
  auto packetizationOpt = strToPacketization(info[0].As<Napi::String>().Utf8Value());
  if (!packetizationOpt.has_value())
  {
    Napi::TypeError::New(env, "packetization must be \"Obu\" or \"TemporalUnit\"")
      .ThrowAsJavaScriptException();
    return;
  }
  auto packetization = packetizationOpt.value();

  if (!info[1].IsObject())
  {
    Napi::TypeError::New(env, "rtpConfig must be a RtpPacketizationConfig instance").ThrowAsJavaScriptException();
    return;
  }
  auto obj = info[1].As<Napi::Object>();
  if (!obj.InstanceOf(RtpPacketizationConfigWrapper::constructor.Value()))
  {
    Napi::TypeError::New(env, "rtpConfig must be a RtpPacketizationConfig instance").ThrowAsJavaScriptException();
    return;
  }
  auto rtpConfig = RtpPacketizationConfigWrapper::Unwrap(obj)->getConfigInstance();

  size_t maxFragmentSize = rtc::RtpPacketizer::DefaultMaxFragmentSize;
  if (info.Length() >= 3)
  {
    if (!info[2].IsNumber())
    {
      Napi::TypeError::New(env, "maxFragmentSize must be a number").ThrowAsJavaScriptException();
      return;
    }
    maxFragmentSize = info[2].As<Napi::Number>().Uint32Value();
  }

  mPacketizerPtr = std::make_unique<rtc::AV1RtpPacketizer>(packetization, rtpConfig, maxFragmentSize);
  instances.insert(this);
}

AV1RtpPacketizerWrapper::~AV1RtpPacketizerWrapper()
{
  mPacketizerPtr.reset();
  instances.erase(this);
}

std::shared_ptr<rtc::AV1RtpPacketizer> AV1RtpPacketizerWrapper::getPacketizerInstance() { return mPacketizerPtr; }

void AV1RtpPacketizerWrapper::addToChain(const Napi::CallbackInfo &info)
{
  auto env = info.Env();
  if (info.Length() < 1 || !info[0].IsObject())
  {
    Napi::TypeError::New(env, "Expected a MediaHandler instance").ThrowAsJavaScriptException();
    return;
  }
  auto mediaHandler = asMediaHandler(info[0].As<Napi::Object>());
  if (!mediaHandler)
  {
    Napi::TypeError::New(env, "Expected a MediaHandler instance. If this error is unexpected, please report a bug!")
      .ThrowAsJavaScriptException();
    return;
  }
  mPacketizerPtr->addToChain(mediaHandler);
}

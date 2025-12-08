#include "media-rtppacketizer-wrapper.h"
#include "media-rtppacketizationconfig-wrapper.h"
#include "media-mediahandler-helper.h"

Napi::FunctionReference RtpPacketizerWrapper::constructor = Napi::FunctionReference();

Napi::Object RtpPacketizerWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<RtpPacketizerWrapper>::DefineClass(env, "RtpPacketizer",
    {
      // Instance Methods
      InstanceMethod("addToChain", &RtpPacketizerWrapper::addToChain),
      // Accessors
      InstanceAccessor("rtpConfig", &RtpPacketizerWrapper::getRtpPacketizationConfig, nullptr),
    });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("RtpPacketizer", func);
  return exports;
}

RtpPacketizerWrapper::RtpPacketizerWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<RtpPacketizerWrapper>(info)
{
  Napi::Env env = info.Env();

  if (!info[0].IsObject())
  {
    Napi::TypeError::New(env, "rtpConfig must be a RtpPacketizationConfig instance").ThrowAsJavaScriptException();
    return;
  }
  auto obj = info[0].As<Napi::Object>();
  if (!obj.InstanceOf(RtpPacketizationConfigWrapper::constructor.Value()))
  {
    Napi::TypeError::New(env, "rtpConfig must be a RtpPacketizationConfig instance").ThrowAsJavaScriptException();
    return;
  }
  // store original JS object so we can return it later
  mRtpConfigObject = Napi::Persistent(obj);
  mRtpConfigObject.SuppressDestruct();
  auto rtpConfig = RtpPacketizationConfigWrapper::Unwrap(obj)->getConfigInstance();

  mPacketizerPtr = std::make_unique<rtc::RtpPacketizer>(rtpConfig);

  auto asMediaHandler = new std::shared_ptr<rtc::MediaHandler>(mPacketizerPtr);
}

RtpPacketizerWrapper::~RtpPacketizerWrapper()
{
  mPacketizerPtr.reset();
  mRtpConfigObject.Reset();
}

std::shared_ptr<rtc::RtpPacketizer> RtpPacketizerWrapper::getPacketizerInstance() { return mPacketizerPtr; }

void RtpPacketizerWrapper::addToChain(const Napi::CallbackInfo &info)
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

Napi::Value RtpPacketizerWrapper::getRtpPacketizationConfig(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (!mPacketizerPtr)
  {
    Napi::Error::New(env, "getRtpPacketizationConfig() called on destroyed packetizer").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (mRtpConfigObject.IsEmpty())
    return env.Null();

  return mRtpConfigObject.Value();
}

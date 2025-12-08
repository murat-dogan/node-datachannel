#include "media-rtcpsrreporter-wrapper.h"
#include "media-rtppacketizationconfig-wrapper.h"
#include "media-mediahandler-helper.h"

Napi::FunctionReference RtcpSrReporterWrapper::constructor = Napi::FunctionReference();

Napi::Object RtcpSrReporterWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<RtcpSrReporterWrapper>::DefineClass(env, "RtcpSrReporter",
    {
      // Instance Methods
      InstanceMethod("addToChain", &RtcpSrReporterWrapper::addToChain),
      // Accessors
      InstanceAccessor("rtpConfig", &RtcpSrReporterWrapper::getRtpPacketizationConfig, nullptr),
    });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("RtcpSrReporter", func);
  return exports;
}

RtcpSrReporterWrapper::RtcpSrReporterWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<RtcpSrReporterWrapper>(info)
{
  Napi::Env env = info.Env();

  if (!info[0].IsObject())
  {
    Napi::TypeError::New(env, "Expected a RtpPacketizationConfig object").ThrowAsJavaScriptException();
    return;
  }

  auto obj = info[0].As<Napi::Object>();
  if (!obj.InstanceOf(RtpPacketizationConfigWrapper::constructor.Value()))
  {
    Napi::TypeError::New(env, "Expected a RtpPacketizationConfig object").ThrowAsJavaScriptException();
    return;
  }
  // store original JS object so we can return it later
  mRtpConfigObject = Napi::Persistent(obj);
  mRtpConfigObject.SuppressDestruct();
  auto config = RtpPacketizationConfigWrapper::Unwrap(obj);
  mReporterPtr = std::make_unique<rtc::RtcpSrReporter>(config->getConfigInstance());
}

RtcpSrReporterWrapper::~RtcpSrReporterWrapper()
{
  mReporterPtr.reset();
  mRtpConfigObject.Reset();
}

std::shared_ptr<rtc::RtcpSrReporter> RtcpSrReporterWrapper::getReporterInstance() { return mReporterPtr; }

void RtcpSrReporterWrapper::addToChain(const Napi::CallbackInfo &info)
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
  mReporterPtr->addToChain(mediaHandler);
}

Napi::Value RtcpSrReporterWrapper::getRtpPacketizationConfig(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  if (!mReporterPtr)
  {
    Napi::Error::New(env, "getRtpPacketizationConfig() called on destroyed reporter").ThrowAsJavaScriptException();
    return env.Null();
  }

  if (mRtpConfigObject.IsEmpty())
    return env.Null();

  return mRtpConfigObject.Value();
}

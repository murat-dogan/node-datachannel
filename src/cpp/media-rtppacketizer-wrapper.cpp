#include "media-rtppacketizer-wrapper.h"
#include "media-rtppacketizationconfig-wrapper.h"

Napi::FunctionReference RtpPacketizerWrapper::constructor = Napi::FunctionReference();
std::unordered_set<RtpPacketizerWrapper *> RtpPacketizerWrapper::instances;

Napi::Object RtpPacketizerWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<RtpPacketizerWrapper>::DefineClass(env, "RtpPacketizer",
                                                                                   {
                                                                                       // Instance Methods
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
  auto rtpConfig = RtpPacketizationConfigWrapper::Unwrap(obj)->getConfigInstance();

  mPacketizerPtr = std::make_unique<rtc::RtpPacketizer>(rtpConfig);
  instances.insert(this);

  auto asMediaHandler = new std::shared_ptr<rtc::MediaHandler>(mPacketizerPtr);
}

RtpPacketizerWrapper::~RtpPacketizerWrapper()
{
  mPacketizerPtr.reset();
  instances.erase(this);
}

std::shared_ptr<rtc::RtpPacketizer> RtpPacketizerWrapper::getPacketizerInstance() { return mPacketizerPtr; }

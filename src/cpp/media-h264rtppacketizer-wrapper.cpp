#include "media-h264rtppacketizer-wrapper.h"
#include "media-rtppacketizationconfig-wrapper.h"

Napi::FunctionReference H264RtpPacketizerWrapper::constructor = Napi::FunctionReference();
std::unordered_set<H264RtpPacketizerWrapper *> H264RtpPacketizerWrapper::instances;

Napi::Object H264RtpPacketizerWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<H264RtpPacketizerWrapper>::DefineClass(env, "H264RtpPacketizer",
                                                                                   {
                                                                                       // Instance Methods
                                                                                   });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("H264RtpPacketizer", func);
  return exports;
}

H264RtpPacketizerWrapper::H264RtpPacketizerWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<H264RtpPacketizerWrapper>(info)
{
  Napi::Env env = info.Env();

  if (info.Length() < 2)
  {
    Napi::Error::New(env, "Expected 2 or 3 parameters").ThrowAsJavaScriptException();
    return;
  }

  rtc::NalUnit::Separator separator;
  if (!info[0].IsNumber())
  {
    Napi::TypeError::New(env, "separator must be a number").ThrowAsJavaScriptException();
    return;
  }
  // Not gonna bother with checking enum values
  separator = static_cast<rtc::NalUnit::Separator>(info[0].As<Napi::Number>().Uint32Value());

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

  mPacketizerPtr = std::make_unique<rtc::H264RtpPacketizer>(separator, rtpConfig, maxFragmentSize);
  instances.insert(this);
}

H264RtpPacketizerWrapper::~H264RtpPacketizerWrapper()
{
  mPacketizerPtr.reset();
  instances.erase(this);
}

std::shared_ptr<rtc::H264RtpPacketizer> H264RtpPacketizerWrapper::getPacketizerInstance() { return mPacketizerPtr; }

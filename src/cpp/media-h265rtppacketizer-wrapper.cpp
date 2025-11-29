#include "media-h265rtppacketizer-wrapper.h"
#include "media-rtppacketizationconfig-wrapper.h"
#include "media-mediahandler-helper.h"

Napi::FunctionReference H265RtpPacketizerWrapper::constructor = Napi::FunctionReference();
std::unordered_set<H265RtpPacketizerWrapper *> H265RtpPacketizerWrapper::instances;

Napi::Object H265RtpPacketizerWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<H265RtpPacketizerWrapper>::DefineClass(env, "H265RtpPacketizer",
    {
      // Instance Methods
      InstanceMethod("addToChain", &H265RtpPacketizerWrapper::addToChain),
    });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("H265RtpPacketizer", func);
  return exports;
}

H265RtpPacketizerWrapper::H265RtpPacketizerWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<H265RtpPacketizerWrapper>(info)
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

  mPacketizerPtr = std::make_unique<rtc::H265RtpPacketizer>(separator, rtpConfig, maxFragmentSize);
  instances.insert(this);
}

H265RtpPacketizerWrapper::~H265RtpPacketizerWrapper()
{
  mPacketizerPtr.reset();
  instances.erase(this);
}

std::shared_ptr<rtc::H265RtpPacketizer> H265RtpPacketizerWrapper::getPacketizerInstance() { return mPacketizerPtr; }

void H265RtpPacketizerWrapper::addToChain(const Napi::CallbackInfo &info)
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

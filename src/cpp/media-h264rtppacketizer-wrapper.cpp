#include "media-h264rtppacketizer-wrapper.h"
#include "media-h26xseparator.h"
#include "media-rtppacketizationconfig-wrapper.h"
#include "media-mediahandler-helper.h"

Napi::FunctionReference H264RtpPacketizerWrapper::constructor = Napi::FunctionReference();
std::unordered_set<H264RtpPacketizerWrapper *> H264RtpPacketizerWrapper::instances;

Napi::Object H264RtpPacketizerWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<H264RtpPacketizerWrapper>::DefineClass(env, "H264RtpPacketizer",
    {
      // Instance Methods
      InstanceMethod("addToChain", &H264RtpPacketizerWrapper::addToChain),
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

  if (!info[0].IsString())
  {
    Napi::TypeError::New(env, "separator must be \"Length\", \"ShortStartSequence\", \"LongStartSequence\" or \"StartSequence\"")
      .ThrowAsJavaScriptException();
    return;
  }
  auto separatorOpt = strToSeparator(info[0].As<Napi::String>().Utf8Value());  
  if (!separatorOpt.has_value())
  {
    Napi::TypeError::New(env, "separator must be \"Length\", \"ShortStartSequence\", \"LongStartSequence\" or \"StartSequence\"")
      .ThrowAsJavaScriptException();
    return;
  }
  auto separator = separatorOpt.value();

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

void H264RtpPacketizerWrapper::addToChain(const Napi::CallbackInfo &info)
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

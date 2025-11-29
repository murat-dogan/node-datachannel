#include "media-rtcpnackresponder-wrapper.h"

Napi::FunctionReference RtcpNackResponderWrapper::constructor = Napi::FunctionReference();
std::unordered_set<RtcpNackResponderWrapper *> RtcpNackResponderWrapper::instances;

Napi::Object RtcpNackResponderWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<RtcpNackResponderWrapper>::DefineClass(env, "RtcpNackResponder",
                                                                                   {
                                                                                       // Instance Methods
                                                                                   });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("RtcpNackResponder", func);
  return exports;
}

RtcpNackResponderWrapper::RtcpNackResponderWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<RtcpNackResponderWrapper>(info)
{
  Napi::Env env = info.Env();

  size_t maxSize = rtc::RtcpNackResponder::DefaultMaxSize;
  if (info.Length() >= 1)
  {
    if (!info[0].IsNumber())
    {
      Napi::TypeError::New(env, "maxSize must be a number").ThrowAsJavaScriptException();
      return;
    }
    maxSize = info[0].As<Napi::Number>().Int64Value();
  }
  mSessionPtr = std::make_unique<rtc::RtcpNackResponder>(maxSize);
  instances.insert(this);
}

RtcpNackResponderWrapper::~RtcpNackResponderWrapper()
{
  mSessionPtr.reset();
  instances.erase(this);
}

std::shared_ptr<rtc::RtcpNackResponder> RtcpNackResponderWrapper::getSessionInstance() { return mSessionPtr; }

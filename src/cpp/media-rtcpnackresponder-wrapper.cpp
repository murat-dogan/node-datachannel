#include "media-rtcpnackresponder-wrapper.h"
#include "media-mediahandler-helper.h"

Napi::FunctionReference RtcpNackResponderWrapper::constructor = Napi::FunctionReference();
std::unordered_set<RtcpNackResponderWrapper *> RtcpNackResponderWrapper::instances;

Napi::Object RtcpNackResponderWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<RtcpNackResponderWrapper>::DefineClass(env, "RtcpNackResponder",
    {
      // Instance Methods
      InstanceMethod("addToChain", &RtcpNackResponderWrapper::addToChain),
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
  mResponderPtr = std::make_unique<rtc::RtcpNackResponder>(maxSize);
  instances.insert(this);
}

RtcpNackResponderWrapper::~RtcpNackResponderWrapper()
{
  mResponderPtr.reset();
  instances.erase(this);
}

std::shared_ptr<rtc::RtcpNackResponder> RtcpNackResponderWrapper::getResponderInstance() { return mResponderPtr; }

void RtcpNackResponderWrapper::addToChain(const Napi::CallbackInfo &info)
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
  mResponderPtr->addToChain(mediaHandler);
}

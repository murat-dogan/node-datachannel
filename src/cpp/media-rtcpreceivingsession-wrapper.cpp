#include "media-rtcpreceivingsession-wrapper.h"
#include "media-mediahandler-helper.h"

Napi::FunctionReference RtcpReceivingSessionWrapper::constructor = Napi::FunctionReference();

Napi::Object RtcpReceivingSessionWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<RtcpReceivingSessionWrapper>::DefineClass(env, "RtcpReceivingSession",
    {
      // Instance Methods
      InstanceMethod("addToChain", &RtcpReceivingSessionWrapper::addToChain),
    });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("RtcpReceivingSession", func);
  return exports;
}

RtcpReceivingSessionWrapper::RtcpReceivingSessionWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<RtcpReceivingSessionWrapper>(info)
{
  Napi::Env env = info.Env();
  mSessionPtr = std::make_unique<rtc::RtcpReceivingSession>();
}

RtcpReceivingSessionWrapper::~RtcpReceivingSessionWrapper()
{
  mSessionPtr.reset();
}

std::shared_ptr<rtc::RtcpReceivingSession> RtcpReceivingSessionWrapper::getSessionInstance() { return mSessionPtr; }

void RtcpReceivingSessionWrapper::addToChain(const Napi::CallbackInfo &info)
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
  mSessionPtr->addToChain(mediaHandler);
}

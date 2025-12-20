#include "media-pacinghandler-wrapper.h"
#include "media-mediahandler-helper.h"

Napi::FunctionReference PacingHandlerWrapper::constructor = Napi::FunctionReference();

Napi::Object PacingHandlerWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<PacingHandlerWrapper>::DefineClass(env, "PacingHandler",
    {
      // Instance Methods
      InstanceMethod("addToChain", &PacingHandlerWrapper::addToChain),
    });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("PacingHandler", func);
  return exports;
}

PacingHandlerWrapper::PacingHandlerWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<PacingHandlerWrapper>(info)
{
  Napi::Env env = info.Env();

  if (info.Length() < 2)
  {
    Napi::TypeError::New(env, "Expected 2 parameters").ThrowAsJavaScriptException();
    return;
  }
  if (!info[0].IsNumber())
  {
    Napi::TypeError::New(env, "Expected bitsPerSecond to be a number").ThrowAsJavaScriptException();
    return;
  }
  if (!info[1].IsNumber())
  {
    Napi::TypeError::New(env, "Expected sendInterval to be a number").ThrowAsJavaScriptException();
    return;
  }
  auto bitsPerSecond = info[0].As<Napi::Number>().DoubleValue();
  auto sendInterval = info[1].As<Napi::Number>().Uint32Value();

  mHandlerPtr = std::make_unique<rtc::PacingHandler>(bitsPerSecond, sendInterval);
}

PacingHandlerWrapper::~PacingHandlerWrapper()
{
  mHandlerPtr.reset();
}

std::shared_ptr<rtc::PacingHandler> PacingHandlerWrapper::getHandlerInstance() { return mHandlerPtr; }

void PacingHandlerWrapper::addToChain(const Napi::CallbackInfo &info)
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
  mHandlerPtr->addToChain(mediaHandler);
}

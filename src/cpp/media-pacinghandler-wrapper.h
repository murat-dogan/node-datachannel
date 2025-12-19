#ifndef MEDIA_PACINGHANDLER_WRAPPER_H
#define MEDIA_PACINGHANDLER_WRAPPER_H

#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

class PacingHandlerWrapper : public Napi::ObjectWrap<PacingHandlerWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  PacingHandlerWrapper(const Napi::CallbackInfo &info);
  ~PacingHandlerWrapper();
  std::shared_ptr<rtc::PacingHandler> getHandlerInstance();

  // Functions
  void addToChain(const Napi::CallbackInfo &info);

  // Callbacks

private:
  std::shared_ptr<rtc::PacingHandler> mHandlerPtr = nullptr;
};

#endif // MEDIA_PACINGHANDLER_WRAPPER_H

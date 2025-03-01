#ifndef ICE_UDP_MUX_LISTENER_WRAPPER_H
#define ICE_UDP_MUX_LISTENER_WRAPPER_H

#include <napi.h>
#include <rtc/rtc.hpp>
#include <unordered_set>

#include "thread-safe-callback.h"

class IceUdpMuxListenerWrapper : public Napi::ObjectWrap<IceUdpMuxListenerWrapper>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  IceUdpMuxListenerWrapper(const Napi::CallbackInfo &info);
  ~IceUdpMuxListenerWrapper();

  // Functions
  void stop(const Napi::CallbackInfo &info);
  void onUnhandledStunRequest(const Napi::CallbackInfo &info);

  // Stop listening on all ports
  static void StopAll();

  // Properties
  Napi::Value port(const Napi::CallbackInfo &info);
  Napi::Value address(const Napi::CallbackInfo &info);
  Napi::Value unhandledStunRequestCallback(const Napi::CallbackInfo &info);

  // Callback Ptrs
  std::unique_ptr<ThreadSafeCallback> mOnUnhandledStunRequestCallback = nullptr;

private:
  static Napi::FunctionReference constructor;
  static std::unordered_set<IceUdpMuxListenerWrapper *> instances;

  void doCleanup();

  std::optional<std::string> mAddress;
  uint16_t mPort;
  std::unique_ptr<rtc::IceUdpMuxListener> iceUdpMuxListenerPtr = nullptr;
};

#endif // ICE_UDP_MUX_LISTENER_WRAPPER_H

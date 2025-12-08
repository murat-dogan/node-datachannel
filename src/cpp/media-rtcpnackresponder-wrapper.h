#ifndef MEDIA_RTCPNACKRESPONDER_WRAPPER_H
#define MEDIA_RTCPNACKRESPONDER_WRAPPER_H

#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

class RtcpNackResponderWrapper : public Napi::ObjectWrap<RtcpNackResponderWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  RtcpNackResponderWrapper(const Napi::CallbackInfo &info);
  ~RtcpNackResponderWrapper();
  std::shared_ptr<rtc::RtcpNackResponder> getResponderInstance();

  // Functions
  void addToChain(const Napi::CallbackInfo &info);

  // Callbacks

private:
  std::shared_ptr<rtc::RtcpNackResponder> mResponderPtr = nullptr;
};

#endif // MEDIA_RTCPNACKRESPONDER_WRAPPER_H

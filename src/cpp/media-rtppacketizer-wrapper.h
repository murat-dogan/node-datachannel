#ifndef MEDIA_RTPPACKETIZER_WRAPPER_H
#define MEDIA_RTPPACKETIZER_WRAPPER_H

#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

class RtpPacketizerWrapper : public Napi::ObjectWrap<RtpPacketizerWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  RtpPacketizerWrapper(const Napi::CallbackInfo &info);
  ~RtpPacketizerWrapper();
  std::shared_ptr<rtc::RtpPacketizer> getPacketizerInstance();

  // Functions
  void addToChain(const Napi::CallbackInfo &info);
  Napi::Value getRtpPacketizationConfig(const Napi::CallbackInfo &info);

  // Callbacks

private:
  std::shared_ptr<rtc::RtpPacketizer> mPacketizerPtr = nullptr;
  Napi::ObjectReference mRtpConfigObject;
};

#endif // MEDIA_RTPPACKETIZER_WRAPPER_H

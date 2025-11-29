#ifndef MEDIA_AV1RTPPACKETIZER_WRAPPER_H
#define MEDIA_AV1RTPPACKETIZER_WRAPPER_H

#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

class AV1RtpPacketizerWrapper : public Napi::ObjectWrap<AV1RtpPacketizerWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  AV1RtpPacketizerWrapper(const Napi::CallbackInfo &info);
  ~AV1RtpPacketizerWrapper();
  std::shared_ptr<rtc::AV1RtpPacketizer> getPacketizerInstance();

  // Functions
  Napi::Value getRtpPacketizationConfig(const Napi::CallbackInfo &info);
  void addToChain(const Napi::CallbackInfo &info);
  // Callbacks

private:
  static std::unordered_set<AV1RtpPacketizerWrapper *> instances;
  std::shared_ptr<rtc::AV1RtpPacketizer> mPacketizerPtr = nullptr;
  Napi::ObjectReference mRtpConfigObject;
};

#endif // MEDIA_AV1RTPPACKETIZER_WRAPPER_H

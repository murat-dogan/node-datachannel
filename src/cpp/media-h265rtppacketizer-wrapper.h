#ifndef MEDIA_H265RTPPACKETIZER_WRAPPER_H
#define MEDIA_H265RTPPACKETIZER_WRAPPER_H

#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

class H265RtpPacketizerWrapper : public Napi::ObjectWrap<H265RtpPacketizerWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  H265RtpPacketizerWrapper(const Napi::CallbackInfo &info);
  ~H265RtpPacketizerWrapper();
  std::shared_ptr<rtc::H265RtpPacketizer> getPacketizerInstance();

  // Functions
  Napi::Value getRtpPacketizationConfig(const Napi::CallbackInfo &info);
  void addToChain(const Napi::CallbackInfo &info);

  // Callbacks

private:
  static std::unordered_set<H265RtpPacketizerWrapper *> instances;
  std::shared_ptr<rtc::H265RtpPacketizer> mPacketizerPtr = nullptr;
  Napi::ObjectReference mRtpConfigObject;
};

#endif // MEDIA_H265RTPPACKETIZER_WRAPPER_H

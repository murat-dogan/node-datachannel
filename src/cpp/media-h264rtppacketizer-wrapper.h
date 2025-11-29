#ifndef MEDIA_H264RTPPACKETIZER_WRAPPER_H
#define MEDIA_H264RTPPACKETIZER_WRAPPER_H

#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

class H264RtpPacketizerWrapper : public Napi::ObjectWrap<H264RtpPacketizerWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  H264RtpPacketizerWrapper(const Napi::CallbackInfo &info);
  ~H264RtpPacketizerWrapper();
  std::shared_ptr<rtc::H264RtpPacketizer> getPacketizerInstance();

  // Functions
  void addToChain(const Napi::CallbackInfo &info);

  // Callbacks

private:
  static std::unordered_set<H264RtpPacketizerWrapper *> instances;
  std::shared_ptr<rtc::H264RtpPacketizer> mPacketizerPtr = nullptr;
};

#endif // MEDIA_H264RTPPACKETIZER_WRAPPER_H

#ifndef MEDIA_RTPPACKETIZATIONCONFIG_WRAPPER_H
#define MEDIA_RTPPACKETIZATIONCONFIG_WRAPPER_H

#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

class RtpPacketizationConfigWrapper : public Napi::ObjectWrap<RtpPacketizationConfigWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  RtpPacketizationConfigWrapper(const Napi::CallbackInfo &info);
  ~RtpPacketizationConfigWrapper();
  std::shared_ptr<rtc::RtpPacketizationConfig> getConfigInstance();

  // Functions

  // Callbacks

private:
  static std::unordered_set<RtpPacketizationConfigWrapper *> instances;
  std::shared_ptr<rtc::RtpPacketizationConfig> mConfigPtr = nullptr;
};

#endif // MEDIA_RTPPACKETIZATIONCONFIG_WRAPPER_H

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
  Napi::Value getPlayoutDelayId(const Napi::CallbackInfo& info);
  void setPlayoutDelayId(const Napi::CallbackInfo& info, const Napi::Value &val);
  Napi::Value getPlayoutDelayMin(const Napi::CallbackInfo& info);
  void setPlayoutDelayMin(const Napi::CallbackInfo& info, const Napi::Value &val);
  Napi::Value getPlayoutDelayMax(const Napi::CallbackInfo& info);
  void setPlayoutDelayMax(const Napi::CallbackInfo& info, const Napi::Value &val);
  Napi::Value getTimestamp(const Napi::CallbackInfo& info);
  void setTimestamp(const Napi::CallbackInfo& info, const Napi::Value &val);
  Napi::Value getClockRate(const Napi::CallbackInfo& info);
  // Callbacks

private:
  std::shared_ptr<rtc::RtpPacketizationConfig> mConfigPtr = nullptr;
};

#endif // MEDIA_RTPPACKETIZATIONCONFIG_WRAPPER_H

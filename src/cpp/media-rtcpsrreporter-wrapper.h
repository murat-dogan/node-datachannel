#ifndef MEDIA_RTCPSRREPORTER_WRAPPER_H
#define MEDIA_RTCPSRREPORTER_WRAPPER_H

#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

class RtcpSrReporterWrapper : public Napi::ObjectWrap<RtcpSrReporterWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  RtcpSrReporterWrapper(const Napi::CallbackInfo &info);
  ~RtcpSrReporterWrapper();
  std::shared_ptr<rtc::RtcpSrReporter> getReporterInstance();

  // Functions

  // Callbacks

private:
  static std::unordered_set<RtcpSrReporterWrapper *> instances;
  std::shared_ptr<rtc::RtcpSrReporter> mReporterPtr = nullptr;
};

#endif // MEDIA_RTCPSRREPORTER_WRAPPER_H

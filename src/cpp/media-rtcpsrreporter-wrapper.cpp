#include "media-rtcpsrreporter-wrapper.h"
#include "media-rtppacketizationconfig-wrapper.h"

Napi::FunctionReference RtcpSrReporterWrapper::constructor = Napi::FunctionReference();
std::unordered_set<RtcpSrReporterWrapper *> RtcpSrReporterWrapper::instances;

Napi::Object RtcpSrReporterWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<RtcpSrReporterWrapper>::DefineClass(env, "RtcpSrReporter",
                                                                                   {
                                                                                       // Instance Methods
                                                                                   });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("RtcpSrReporter", func);
  return exports;
}

RtcpSrReporterWrapper::RtcpSrReporterWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<RtcpSrReporterWrapper>(info)
{
  Napi::Env env = info.Env();

  if (!info[0].IsObject())
  {
    Napi::TypeError::New(env, "Expected a RtpPacketizationConfig object").ThrowAsJavaScriptException();
    return;
  }

  auto obj = info[0].As<Napi::Object>();
  if (!obj.InstanceOf(RtpPacketizationConfigWrapper::constructor.Value()))
  {
    Napi::TypeError::New(env, "Expected a RtpPacketizationConfig object").ThrowAsJavaScriptException();
    return;
  }
  auto config = RtpPacketizationConfigWrapper::Unwrap(obj);
  mReporterPtr = std::make_unique<rtc::RtcpSrReporter>(config->getConfigInstance());
  instances.insert(this);
}

RtcpSrReporterWrapper::~RtcpSrReporterWrapper()
{
  mReporterPtr.reset();
  instances.erase(this);
}

std::shared_ptr<rtc::RtcpSrReporter> RtcpSrReporterWrapper::getReporterInstance() { return mReporterPtr; }

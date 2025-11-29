#include "media-rtppacketizationconfig-wrapper.h"

Napi::FunctionReference RtpPacketizationConfigWrapper::constructor = Napi::FunctionReference();
std::unordered_set<RtpPacketizationConfigWrapper *> RtpPacketizationConfigWrapper::instances;

Napi::Object RtpPacketizationConfigWrapper::Init(Napi::Env env, Napi::Object exports)
{
  Napi::HandleScope scope(env);

  Napi::Function func = Napi::ObjectWrap<RtpPacketizationConfigWrapper>::DefineClass(env, "RtpPacketizationConfig",
    {
      // Instance Methods
      InstanceAccessor("playoutDelayId",
        &RtpPacketizationConfigWrapper::getPlayoutDelayId,
        &RtpPacketizationConfigWrapper::setPlayoutDelayId
      ),
      InstanceAccessor("playoutDelayMin",
        &RtpPacketizationConfigWrapper::getPlayoutDelayMin,
        &RtpPacketizationConfigWrapper::setPlayoutDelayMin
      ),
      InstanceAccessor("playoutDelayMax",
        &RtpPacketizationConfigWrapper::getPlayoutDelayMax,
        &RtpPacketizationConfigWrapper::setPlayoutDelayMax
      ),
      InstanceAccessor("timestamp",
        &RtpPacketizationConfigWrapper::getTimestamp,
        &RtpPacketizationConfigWrapper::setTimestamp
      ),
      InstanceAccessor("clockRate",
        &RtpPacketizationConfigWrapper::getClockRate,
        nullptr
      ),
    });

  // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
  if (constructor.IsEmpty())
  {
    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();
  }

  exports.Set("RtpPacketizationConfig", func);
  return exports;
}

RtpPacketizationConfigWrapper::RtpPacketizationConfigWrapper(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<RtpPacketizationConfigWrapper>(info)
{
  Napi::Env env = info.Env();

  if (info.Length() < 4)
  {
    Napi::Error::New(env, "RtpPacketizationConfig constructor requires 4 or 5 parameters").ThrowAsJavaScriptException();
    return;
  }

  rtc::SSRC ssrc;
  if (!info[0].IsNumber())
  {
    Napi::TypeError::New(env, "ssrc must be a number").ThrowAsJavaScriptException();
    return;
  }
  ssrc = info[0].As<Napi::Number>().Uint32Value();

  std::string cname;
  if (!info[1].IsString())
  {
    Napi::TypeError::New(env, "cname must be a string").ThrowAsJavaScriptException();
    return;
  }
  cname = info[1].As<Napi::String>().Utf8Value();

  uint8_t payloadType;
  if (!info[2].IsNumber())
  {
    Napi::TypeError::New(env, "payloadType must be a number").ThrowAsJavaScriptException();
    return;
  }
  payloadType = info[2].As<Napi::Number>().Uint32Value();

  uint32_t clockRate;
  if (!info[3].IsNumber())
  {
    Napi::TypeError::New(env, "clockRate must be a number").ThrowAsJavaScriptException();
    return;
  }
  clockRate = info[3].As<Napi::Number>().Uint32Value();

  uint8_t videoOrientationId = 0;
  if (info.Length() >= 5)
  {
    if (!info[4].IsNumber())
    {
      Napi::TypeError::New(env, "videoOrientationId must be a number").ThrowAsJavaScriptException();
      return;
    }
    videoOrientationId = info[4].As<Napi::Number>().Uint32Value();
  }
  mConfigPtr = std::make_unique<rtc::RtpPacketizationConfig>(ssrc, cname, payloadType, clockRate, videoOrientationId);
  instances.insert(this);
}

RtpPacketizationConfigWrapper::~RtpPacketizationConfigWrapper()
{
  mConfigPtr.reset();
  instances.erase(this);
}

std::shared_ptr<rtc::RtpPacketizationConfig> RtpPacketizationConfigWrapper::getConfigInstance() { return mConfigPtr; }

Napi::Value RtpPacketizationConfigWrapper::getPlayoutDelayId(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), mConfigPtr->playoutDelayId);
}
void RtpPacketizationConfigWrapper::setPlayoutDelayId(const Napi::CallbackInfo &info, const Napi::Value &val)
{
  auto env = info.Env();
  if (!val.IsNumber())
  {
    Napi::TypeError::New(env, "Expected a number").ThrowAsJavaScriptException();
    return;
  }
  mConfigPtr->playoutDelayId = val.As<Napi::Number>().Uint32Value();
}
Napi::Value RtpPacketizationConfigWrapper::getPlayoutDelayMin(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), mConfigPtr->playoutDelayMin);
}
void RtpPacketizationConfigWrapper::setPlayoutDelayMin(const Napi::CallbackInfo &info, const Napi::Value &val)
{
  auto env = info.Env();
  if (!val.IsNumber())
  {
    Napi::TypeError::New(env, "Expected a number").ThrowAsJavaScriptException();
    return;
  }
  mConfigPtr->playoutDelayMin = val.As<Napi::Number>().Uint32Value();
}
Napi::Value RtpPacketizationConfigWrapper::getPlayoutDelayMax(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), mConfigPtr->playoutDelayMax);
}
void RtpPacketizationConfigWrapper::setPlayoutDelayMax(const Napi::CallbackInfo &info, const Napi::Value &val)
{
  auto env = info.Env();
  if (!val.IsNumber())
  {
    Napi::TypeError::New(env, "Expected a number").ThrowAsJavaScriptException();
    return;
  }
  mConfigPtr->playoutDelayMax = val.As<Napi::Number>().Uint32Value();
}
Napi::Value RtpPacketizationConfigWrapper::getTimestamp(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), mConfigPtr->timestamp);
}
void RtpPacketizationConfigWrapper::setTimestamp(const Napi::CallbackInfo &info, const Napi::Value &val)
{
  auto env = info.Env();
  if (!val.IsNumber())
  {
    Napi::TypeError::New(env, "Expected a number").ThrowAsJavaScriptException();
    return;
  }
  mConfigPtr->timestamp = val.As<Napi::Number>().Uint32Value();
}
Napi::Value RtpPacketizationConfigWrapper::getClockRate(const Napi::CallbackInfo &info)
{
  return Napi::Number::New(info.Env(), mConfigPtr->clockRate);
}

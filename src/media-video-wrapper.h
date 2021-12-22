#ifndef MEDIA_VIDEO_WRAPPER_H
#define MEDIA_VIDEO_WRAPPER_H

#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "thread-safe-callback.h"

class VideoWrapper : public Napi::ObjectWrap<VideoWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  VideoWrapper(const Napi::CallbackInfo &info);
  ~VideoWrapper();

  // Functions

  void addVideoCodec(const Napi::CallbackInfo &info);
  void addH264Codec(const Napi::CallbackInfo &info);
  void addVP8Codec(const Napi::CallbackInfo &info);
  void addVP9Codec(const Napi::CallbackInfo &info);

  // Callbacks

private:
  static std::unordered_set<VideoWrapper *> instances;
  std::shared_ptr<rtc::Description::Video> mVideoPtr = nullptr;
};

#endif // MEDIA_VIDEO_WRAPPER_H
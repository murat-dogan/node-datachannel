#ifndef MEDIA_AUDIO_WRAPPER_H
#define MEDIA_AUDIO_WRAPPER_H

#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "thread-safe-callback.h"

class AudioWrapper : public Napi::ObjectWrap<AudioWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  AudioWrapper(const Napi::CallbackInfo &info);
  ~AudioWrapper();

  // Functions

  void addAudioCodec(const Napi::CallbackInfo &info);
  void addOpusCodec(const Napi::CallbackInfo &info);

  // Callbacks

private:
  static std::unordered_set<AudioWrapper *> instances;
  std::shared_ptr<rtc::Description::Audio> mAudioPtr = nullptr;
};

#endif // MEDIA_AUDIO_WRAPPER_H
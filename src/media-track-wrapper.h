#ifndef MEDIA_TRACK_WRAPPER_H
#define MEDIA_TRACK_WRAPPER_H

#include <iostream>
#include <string>
#include <variant>
#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "thread-safe-callback.h"

class TrackWrapper : public Napi::ObjectWrap<TrackWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  TrackWrapper(const Napi::CallbackInfo &info);
  ~TrackWrapper();

  // Functions
  Napi::Value direction(const Napi::CallbackInfo &info);
  Napi::Value mid(const Napi::CallbackInfo &info);
  void close(const Napi::CallbackInfo &info);
  Napi::Value sendMessage(const Napi::CallbackInfo &info);
  Napi::Value sendMessageBinary(const Napi::CallbackInfo &info);
  Napi::Value isOpen(const Napi::CallbackInfo &info);
  Napi::Value isClosed(const Napi::CallbackInfo &info);
  Napi::Value availableAmount(const Napi::CallbackInfo &info);
  Napi::Value bufferedAmount(const Napi::CallbackInfo &info);
  Napi::Value maxMessageSize(const Napi::CallbackInfo &info);
  void setBufferedAmountLowThreshold(const Napi::CallbackInfo &info);
  Napi::Value requestKeyframe(const Napi::CallbackInfo &info);
  void setMediaHandler(const Napi::CallbackInfo &info);

  // Callbacks
  void onOpen(const Napi::CallbackInfo &info);
  void onClosed(const Napi::CallbackInfo &info);
  void onError(const Napi::CallbackInfo &info);
  void onAvailable(const Napi::CallbackInfo &info);
  void onBufferedAmountLow(const Napi::CallbackInfo &info);
  void onMessage(const Napi::CallbackInfo &info);

private:
  static std::unordered_set<TrackWrapper *> instances;

  void doClose();

  std::shared_ptr<rtc::Track> mTrackPtr = nullptr;

    // Callback Ptrs
  std::unique_ptr<ThreadSafeCallback> mOnOpenCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnClosedCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnErrorCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnAvailableCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnBufferedAmountLowCallback = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnMessageCallback = nullptr;
};

#endif // MEDIA_TRACK_WRAPPER_H
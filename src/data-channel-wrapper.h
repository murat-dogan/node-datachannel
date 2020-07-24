#ifndef DATA_CHANNEL_WRAPPER_H
#define DATA_CHANNEL_WRAPPER_H

#include <iostream>
#include <string>
#include <variant>
#include <memory>
#include <napi.h>
#include <napi-thread-safe-callback.hpp>
#include "rtc/rtc.hpp"

class DataChannelWrapper : public Napi::ObjectWrap<DataChannelWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  DataChannelWrapper(const Napi::CallbackInfo &info);
  ~DataChannelWrapper();

  // Functions
  void close(const Napi::CallbackInfo &info);
  Napi::Value getLabel(const Napi::CallbackInfo &info);
  Napi::Value sendMessage(const Napi::CallbackInfo &info);
  Napi::Value isOpen(const Napi::CallbackInfo &info);
  Napi::Value availableAmount(const Napi::CallbackInfo &info);
  Napi::Value bufferedAmount(const Napi::CallbackInfo &info);
  Napi::Value maxMessageSize(const Napi::CallbackInfo &info);

  // Callbacks
  void onOpen(const Napi::CallbackInfo &info);
  void onClosed(const Napi::CallbackInfo &info);
  void onError(const Napi::CallbackInfo &info);
  void onAvailable(const Napi::CallbackInfo &info);
  void onBufferedAmountLow(const Napi::CallbackInfo &info);
  void onMessage(const Napi::CallbackInfo &info);

private:
  std::string mLabel;
  std::shared_ptr<rtc::DataChannel> mDataChannelPtr = nullptr;

  // Callback Ptrs
  std::shared_ptr<ThreadSafeCallback> mOnOpenCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnClosedCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnErrorCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnAvailableCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnBufferedAmountLowCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnMessageCallback = nullptr;
};

#endif // DATA_CHANNEL_WRAPPER_H
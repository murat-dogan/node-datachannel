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
  void setCallback(const Napi::CallbackInfo &info);
  Napi::Value getLabel(const Napi::CallbackInfo &info);
  Napi::Value sendMessage(const Napi::CallbackInfo &info);
  Napi::Value isOpen(const Napi::CallbackInfo &info);
  Napi::Value availableAmount(const Napi::CallbackInfo &info);
  Napi::Value bufferedAmount(const Napi::CallbackInfo &info);
  Napi::Value maxMessageSize(const Napi::CallbackInfo &info);

private:
  std::string mLabel;
  std::shared_ptr<rtc::DataChannel> mDataChannelPtr = nullptr;
  std::shared_ptr<ThreadSafeCallback> mCallback = nullptr;
};

#endif // DATA_CHANNEL_WRAPPER_H
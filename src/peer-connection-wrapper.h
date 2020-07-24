#ifndef PEER_CONNECTION_WRAPPER_H
#define PEER_CONNECTION_WRAPPER_H

#include <iostream>
#include <string>
#include <variant>
#include <memory>
#include <napi.h>
#include <napi-thread-safe-callback.hpp>
#include "rtc/rtc.hpp"

class PeerConnectionWrapper : public Napi::ObjectWrap<PeerConnectionWrapper>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  PeerConnectionWrapper(const Napi::CallbackInfo &info);
  ~PeerConnectionWrapper();

  // Functions
  void close(const Napi::CallbackInfo &info);
  void setRemoteDescription(const Napi::CallbackInfo &info);
  void addRemoteCandidate(const Napi::CallbackInfo &info);
  Napi::Value createDataChannel(const Napi::CallbackInfo &info);

  // Callbacks
  void onLocalDescription(const Napi::CallbackInfo &info);
  void onLocalCandidate(const Napi::CallbackInfo &info);
  void onStateChange(const Napi::CallbackInfo &info);
  void onGatheringStateChange(const Napi::CallbackInfo &info);
  void onDataChannel(const Napi::CallbackInfo &info);

private:
  static Napi::FunctionReference constructor;
  std::string mPeerName;
  std::shared_ptr<rtc::PeerConnection> mRtcPeerConnPtr = nullptr;

  // Callback Ptrs
  std::shared_ptr<ThreadSafeCallback> mOnLocalDescriptionCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnLocalCandidateCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnStateChangeCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnGatheringStateChangeCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnDataChannelCallback = nullptr;
};

#endif // PEER_CONNECTION_WRAPPER_H
#ifndef PEER_CONNECTION_WRAPPER_H
#define PEER_CONNECTION_WRAPPER_H

#include <iostream>
#include <string>
#include <variant>
#include <memory>
#include <unordered_set>

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

  // Stats
  Napi::Value bytesSent(const Napi::CallbackInfo &info);
  Napi::Value bytesReceived(const Napi::CallbackInfo &info);
  Napi::Value rtt(const Napi::CallbackInfo &info);
  Napi::Value getSelectedCandidatePair(const Napi::CallbackInfo &info);

  // Close all existing DataChannels
  static void CloseAll();

private:
  static Napi::FunctionReference constructor;
  static std::unordered_set<PeerConnectionWrapper*> instances;

  void doClose();

  std::string mPeerName;
  std::shared_ptr<rtc::PeerConnection> mRtcPeerConnPtr = nullptr;

  // Callback Ptrs
  std::shared_ptr<ThreadSafeCallback> mOnLocalDescriptionCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnLocalCandidateCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnStateChangeCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnGatheringStateChangeCallback = nullptr;
  std::shared_ptr<ThreadSafeCallback> mOnDataChannelCallback = nullptr;

  // Helpers
  std::string candidateTypeToString(const rtc::Candidate::Type &type);
  std::string candidateTransportTypeToString(const rtc::Candidate::TransportType &transportType);
};

#endif // PEER_CONNECTION_WRAPPER_H

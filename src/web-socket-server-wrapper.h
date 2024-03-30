#ifndef WEB_SOCKET_SERVER_WRAPPER_H
#define WEB_SOCKET_SERVER_WRAPPER_H

#include <iostream>
#include <string>
#include <variant>
#include <memory>
#include <unordered_set>

#include <napi.h>
#include <rtc/rtc.hpp>

#include "web-socket-wrapper.h"
#include "thread-safe-callback.h"

class WebSocketServerWrapper : public Napi::ObjectWrap<WebSocketServerWrapper>
{
public:
  static Napi::FunctionReference constructor;
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  WebSocketServerWrapper(const Napi::CallbackInfo &info);
  ~WebSocketServerWrapper();

  // Functions

  void stop(const Napi::CallbackInfo &info);
  Napi::Value port(const Napi::CallbackInfo &info);

  // Callbacks
  void onClient(const Napi::CallbackInfo &info);

  // Close all existing WebSocketServers
  static void StopAll();
 
private:
  static std::unordered_set<WebSocketServerWrapper*> instances;
  std::unique_ptr<rtc::WebSocketServer> mWebSocketServerPtr = nullptr;
  std::unique_ptr<ThreadSafeCallback> mOnClientCallback = nullptr;

  void doStop();
};

#endif // WEB_SOCKET_SERVER_WRAPPER_H

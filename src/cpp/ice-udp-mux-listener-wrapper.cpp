#include "ice-udp-mux-listener-wrapper.h"

#include "plog/Log.h"

#include <cctype>
#include <sstream>

Napi::FunctionReference IceUdpMuxListenerWrapper::constructor = Napi::FunctionReference();
std::unordered_set<IceUdpMuxListenerWrapper *> IceUdpMuxListenerWrapper::instances;

void IceUdpMuxListenerWrapper::StopAll()
{
    PLOG_DEBUG << "IceUdpMuxListenerWrapper StopAll() called";
    auto copy(instances);
    for (auto inst : copy)
        inst->doCleanup();
}

Napi::Object IceUdpMuxListenerWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "IceUdpMuxListener",
        {
            InstanceMethod("stop", &IceUdpMuxListenerWrapper::stop),
            InstanceMethod("onUnhandledStunRequest", &IceUdpMuxListenerWrapper::onUnhandledStunRequest),
            InstanceMethod("port", &IceUdpMuxListenerWrapper::port),
            InstanceMethod("address", &IceUdpMuxListenerWrapper::address)
        });

    // If this is not the first call, we don't want to reassign the constructor (hot-reload problem)
    if(constructor.IsEmpty())
    {
        constructor = Napi::Persistent(func);
        constructor.SuppressDestruct();
    }

    exports.Set("IceUdpMuxListener", func);
    return exports;
}

IceUdpMuxListenerWrapper::IceUdpMuxListenerWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<IceUdpMuxListenerWrapper>(info)
{
    PLOG_DEBUG << "IceUdpMuxListenerWrapper Constructor called";
    Napi::Env env = info.Env();
    int length = info.Length();

    // We expect (Number, String?) as param
    if (length > 0 && info[0].IsNumber()) {
      // Port
      mPort = info[0].As<Napi::Number>().ToNumber().Uint32Value();
    } else {
      Napi::TypeError::New(env, "Port (Number) and optional Address (String) expected").ThrowAsJavaScriptException();
      return;
    }

    if (length > 1 && info[1].IsString()) {
      // Address
      mAddress = info[1].As<Napi::String>().ToString();
    }

    iceUdpMuxListenerPtr = std::make_unique<rtc::IceUdpMuxListener>(mPort, mAddress);
    instances.insert(this);
}

IceUdpMuxListenerWrapper::~IceUdpMuxListenerWrapper()
{
    PLOG_DEBUG << "IceUdpMuxListenerWrapper Destructor called";
    doCleanup();
}

void IceUdpMuxListenerWrapper::doCleanup()
{
    PLOG_DEBUG << "IceUdpMuxListenerWrapper::doCleanup() called";

    if (iceUdpMuxListenerPtr)
    {
      iceUdpMuxListenerPtr->stop();
      iceUdpMuxListenerPtr.reset();
    }

    mOnUnhandledStunRequestCallback.reset();
    instances.erase(this);
}

Napi::Value IceUdpMuxListenerWrapper::port(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    return Napi::Number::New(env, mPort);
}

Napi::Value IceUdpMuxListenerWrapper::address(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (!mAddress.has_value()) {
      return env.Undefined();
    }

    return Napi::String::New(env, mAddress.value());
}

void IceUdpMuxListenerWrapper::stop(const Napi::CallbackInfo &info)
{
  PLOG_DEBUG << "IceUdpMuxListenerWrapper::stop() called";
  doCleanup();
}

void IceUdpMuxListenerWrapper::onUnhandledStunRequest(const Napi::CallbackInfo &info)
{
    PLOG_DEBUG << "IceUdpMuxListenerWrapper::onUnhandledStunRequest() called";
    Napi::Env env = info.Env();
    int length = info.Length();

    if (!iceUdpMuxListenerPtr)
    {
        Napi::Error::New(env, "IceUdpMuxListenerWrapper::onUnhandledStunRequest() called on destroyed IceUdpMuxListener").ThrowAsJavaScriptException();
        return;
    }

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnUnhandledStunRequestCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    iceUdpMuxListenerPtr->OnUnhandledStunRequest([&](rtc::IceUdpMuxRequest request)
    {
        PLOG_DEBUG << "IceUdpMuxListenerWrapper::onUnhandledStunRequest() IceUdpMuxCallback call(1)";

        if (mOnUnhandledStunRequestCallback) {
            mOnUnhandledStunRequestCallback->call([request = std::move(request)](Napi::Env env, std::vector<napi_value> &args) {
                Napi::Object reqObj = Napi::Object::New(env);
                reqObj.Set("ufrag", request.remoteUfrag.c_str());
                reqObj.Set("host", request.remoteAddress.c_str());
                reqObj.Set("port", request.remotePort);

                args = {reqObj};
            });
        }

        PLOG_DEBUG << "IceUdpMuxListenerWrapper::onUnhandledStunRequest() IceUdpMuxCallback call(2)";
    });
}

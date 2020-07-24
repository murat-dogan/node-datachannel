#include "peer-connection-wrapper.h"
#include "data-channel-wrapper.h"

Napi::FunctionReference PeerConnectionWrapper::constructor;

Napi::Object PeerConnectionWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "PeerConnection",
        {InstanceMethod("close", &PeerConnectionWrapper::close),
         InstanceMethod("setRemoteDescription", &PeerConnectionWrapper::setRemoteDescription),
         InstanceMethod("addRemoteCandidate", &PeerConnectionWrapper::addRemoteCandidate),
         InstanceMethod("createDataChannel", &PeerConnectionWrapper::createDataChannel)});

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("PeerConnection", func);
    return exports;
}

PeerConnectionWrapper::PeerConnectionWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<PeerConnectionWrapper>(info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    // We expect (String, Object, Function) as param
    if (length < 3 || !info[0].IsString() || !info[1].IsObject() || !info[2].IsFunction())
    {
        Napi::TypeError::New(env, "Peer Name (String) & Configuration (Object) & Callback expected").ThrowAsJavaScriptException();
        return;
    }

    // Peer Name
    mPeerName = info[0].As<Napi::String>().ToString();

    // Peer Config
    rtc::Configuration rtcConfig;
    Napi::Object config = info[1].As<Napi::Object>();
    if (!config.Get("iceServers").IsArray())
    {
        Napi::TypeError::New(env, "iceServers(Array) expected").ThrowAsJavaScriptException();
        return;
    }

    Napi::Array iceServers = config.Get("iceServers").As<Napi::Array>();
    for (uint32_t i = 0; i < iceServers.Length(); i++)
    {
        rtcConfig.iceServers.emplace_back(iceServers.Get(i).As<Napi::String>().ToString());
    }

    // Create peer-connection
    mRtcPeerConnPtr = std::make_shared<rtc::PeerConnection>(rtcConfig);

    // Callback
    mCallback = std::make_shared<ThreadSafeCallback>(info[2].As<Napi::Function>());

    // Signals
    mRtcPeerConnPtr->onLocalDescription([&](const rtc::Description &sdp) {
        mCallback->call([sdp](Napi::Env env, std::vector<napi_value> &args) {
            // This will run in main thread and needs to construct the
            // arguments for the call
            args = {
                Napi::String::New(env, "sdp"),
                Napi::String::New(env, std::string(sdp))};
        });
    });

    mRtcPeerConnPtr->onLocalCandidate([&](const rtc::Candidate &candidate) {
        mCallback->call([candidate](Napi::Env env, std::vector<napi_value> &args) {
            // This will run in main thread and needs to construct the
            // arguments for the call
            args = {
                Napi::String::New(env, "candidate"),
                Napi::String::New(env, std::string(candidate))};
        });
    });

    mRtcPeerConnPtr->onStateChange([&](rtc::PeerConnection::State state) {
        mCallback->call([state](Napi::Env env, std::vector<napi_value> &args) {
            // This will run in main thread and needs to construct the
            // arguments for the call
            std::ostringstream stream;
            stream << state;
            args = {
                Napi::String::New(env, "state"),
                Napi::String::New(env, stream.str())};
        });
    });

    mRtcPeerConnPtr->onGatheringStateChange([&](rtc::PeerConnection::GatheringState state) {
        mCallback->call([state](Napi::Env env, std::vector<napi_value> &args) {
            // This will run in main thread and needs to construct the
            // arguments for the call
            std::ostringstream stream;
            stream << state;
            args = {
                Napi::String::New(env, "gathering-state"),
                Napi::String::New(env, stream.str())};
        });
    });

    mRtcPeerConnPtr->onDataChannel([&](std::shared_ptr<rtc::DataChannel> dc) {
        mCallback->call([dc](Napi::Env env, std::vector<napi_value> &args) {
            // This will run in main thread and needs to construct the
            // arguments for the call
            std::shared_ptr<rtc::DataChannel> dataChannel = dc;
            auto instance = DataChannelWrapper::constructor.New({Napi::External<std::shared_ptr<rtc::DataChannel>>::New(env, &dataChannel)});
            args = {
                Napi::String::New(env, "data-channel"),
                instance};
        });
    });
}

PeerConnectionWrapper::~PeerConnectionWrapper()
{
    if (mRtcPeerConnPtr)
    {
        mRtcPeerConnPtr->close();
        mRtcPeerConnPtr.reset();
    }
}

void PeerConnectionWrapper::close(const Napi::CallbackInfo &info)
{
    if (!mRtcPeerConnPtr)
    {
        Napi::TypeError::New(info.Env(), "It seems peer-connection is closed").ThrowAsJavaScriptException();
        return;
    }

    mRtcPeerConnPtr->close();
    mRtcPeerConnPtr.reset();
}

void PeerConnectionWrapper::setRemoteDescription(const Napi::CallbackInfo &info)
{
    if (!mRtcPeerConnPtr)
    {
        Napi::TypeError::New(info.Env(), "It seems peer-connection is closed").ThrowAsJavaScriptException();
        return;
    }

    int length = info.Length();
    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(info.Env(), "String expected").ThrowAsJavaScriptException();
        return;
    }

    std::string sdp = mPeerName = info[0].As<Napi::String>().ToString();
    rtc::Description desc(sdp);
    mRtcPeerConnPtr->setRemoteDescription(desc);
}

void PeerConnectionWrapper::addRemoteCandidate(const Napi::CallbackInfo &info)
{
    if (!mRtcPeerConnPtr)
    {
        Napi::TypeError::New(info.Env(), "It seems peer-connection is closed").ThrowAsJavaScriptException();
        return;
    }

    int length = info.Length();
    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(info.Env(), "String expected").ThrowAsJavaScriptException();
        return;
    }

    std::string candidate = mPeerName = info[0].As<Napi::String>().ToString();
    mRtcPeerConnPtr->addRemoteCandidate(candidate);
}

Napi::Value PeerConnectionWrapper::createDataChannel(const Napi::CallbackInfo &info)
{
    if (!mRtcPeerConnPtr)
    {
        Napi::TypeError::New(info.Env(), "It seems peer-connection is closed").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "Data Channel Label expected").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    std::string label = info[0].As<Napi::String>().ToString();
    std::shared_ptr<rtc::DataChannel> dataChannel = mRtcPeerConnPtr->createDataChannel(label);

    auto instance = DataChannelWrapper::constructor.New({Napi::External<std::shared_ptr<rtc::DataChannel>>::New(info.Env(), &dataChannel)});
    return instance;
}
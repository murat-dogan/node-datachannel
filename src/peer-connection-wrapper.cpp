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
         InstanceMethod("createDataChannel", &PeerConnectionWrapper::createDataChannel),
         InstanceMethod("onLocalDescription", &PeerConnectionWrapper::onLocalDescription),
         InstanceMethod("onLocalCandidate", &PeerConnectionWrapper::onLocalCandidate),
         InstanceMethod("onStateChange", &PeerConnectionWrapper::onStateChange),
         InstanceMethod("onGatheringStateChange", &PeerConnectionWrapper::onGatheringStateChange),
         InstanceMethod("onDataChannel", &PeerConnectionWrapper::onDataChannel)});

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
    if (length < 2 || !info[0].IsString() || !info[1].IsObject())
    {
        Napi::TypeError::New(env, "Peer Name (String) & Configuration (Object) expected").ThrowAsJavaScriptException();
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

    // Proxy Server
    if (config.Get("proxyServer").IsObject())
    {
        Napi::Object proxyServer = config.Get("proxyServer").As<Napi::Object>();

        // IP
        std::string ip = proxyServer.Get("ip").As<Napi::String>();

        // Port
        uint16_t port = proxyServer.Get("port").As<Napi::Number>().Uint32Value();

        // Type
        std::string strType = proxyServer.Get("type").As<Napi::String>().ToString();
        rtc::ProxyServer::Type type = rtc::ProxyServer::Type::Http;

        if (strType == "None")
            type = rtc::ProxyServer::Type::None;
        if (strType == "Http")
            type = rtc::ProxyServer::Type::Http;
        if (strType == "Socks5")
            type = rtc::ProxyServer::Type::Socks5;

        // Username & Password
        std::string username = "";
        std::string password = "";

        if (proxyServer.Get("username").IsString())
            username = proxyServer.Get("username").As<Napi::String>().ToString();
        if (proxyServer.Get("password").IsString())
            username = proxyServer.Get("password").As<Napi::String>().ToString();

        rtcConfig.proxyServer = rtc::ProxyServer(type, ip, port, username, password);
    }

    // Port Ranges
    if (config.Get("portRangeBegin").IsNumber())
        rtcConfig.portRangeBegin = config.Get("portRangeBegin").As<Napi::Number>().Uint32Value();
    if (config.Get("portRangeEnd").IsNumber())
        rtcConfig.portRangeEnd = config.Get("portRangeEnd").As<Napi::Number>().Uint32Value();

    // enableIceTcp option
    if (config.Get("enableIceTcp").IsBoolean())
        rtcConfig.enableIceTcp = config.Get("enableIceTcp").As<Napi::Boolean>();

    // Create peer-connection
    try
    {
        mRtcPeerConnPtr = std::make_shared<rtc::PeerConnection>(rtcConfig);
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while creating peerConnection# ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }

    // Signals
    mRtcPeerConnPtr->onLocalDescription([&](const rtc::Description &sdp) {
        if (mOnLocalDescriptionCallback)
            mOnLocalDescriptionCallback->call([sdp](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {
                    Napi::String::New(env, std::string(sdp)),
                    Napi::String::New(env, sdp.typeString())};
            });
    });

    mRtcPeerConnPtr->onLocalCandidate([&](const rtc::Candidate &candidate) {
        if (mOnLocalCandidateCallback)
            mOnLocalCandidateCallback->call([candidate](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {
                    Napi::String::New(env, std::string(candidate)),
                    Napi::String::New(env, candidate.mid())};
            });
    });

    mRtcPeerConnPtr->onStateChange([&](rtc::PeerConnection::State state) {
        if (mOnStateChangeCallback)
            mOnStateChangeCallback->call([state](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                std::ostringstream stream;
                stream << state;
                args = {Napi::String::New(env, stream.str())};
            });
    });

    mRtcPeerConnPtr->onGatheringStateChange([&](rtc::PeerConnection::GatheringState state) {
        if (mOnGatheringStateChangeCallback)
            mOnGatheringStateChangeCallback->call([state](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                std::ostringstream stream;
                stream << state;
                args = {Napi::String::New(env, stream.str())};
            });
    });

    mRtcPeerConnPtr->onDataChannel([&](std::shared_ptr<rtc::DataChannel> dc) {
        if (mOnDataChannelCallback)
            mOnDataChannelCallback->call([dc](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                std::shared_ptr<rtc::DataChannel> dataChannel = dc;
                auto instance = DataChannelWrapper::constructor.New({Napi::External<std::shared_ptr<rtc::DataChannel>>::New(env, &dataChannel)});
                args = {instance};
            });
    });
}

PeerConnectionWrapper::~PeerConnectionWrapper()
{
    if (mRtcPeerConnPtr)
    {
        try
        {
            mRtcPeerConnPtr->close();
            mRtcPeerConnPtr.reset();
        }
        catch (std::exception &ex)
        {
            std::cout << std::string("libdatachannel error while closing peerConnection# ") + ex.what() << std::endl;
            return;
        }
    }
}

void PeerConnectionWrapper::close(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(info.Env(), "It seems peer-connection is closed").ThrowAsJavaScriptException();
        return;
    }

    try
    {
        mRtcPeerConnPtr->close();
        mRtcPeerConnPtr.reset();
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while closing peerConnection# ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

void PeerConnectionWrapper::setRemoteDescription(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(info.Env(), "It seems peer-connection is closed").ThrowAsJavaScriptException();
        return;
    }

    int length = info.Length();
    if (length < 2 || !info[0].IsString() || !info[1].IsString())
    {
        Napi::TypeError::New(info.Env(), "String,String expected").ThrowAsJavaScriptException();
        return;
    }

    std::string sdp = info[0].As<Napi::String>().ToString();
    std::string type = info[1].As<Napi::String>().ToString();

    try
    {
        rtc::Description desc(sdp, type);
        mRtcPeerConnPtr->setRemoteDescription(desc);
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while adding remote decsription # ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

void PeerConnectionWrapper::addRemoteCandidate(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(info.Env(), "It seems peer-connection is closed").ThrowAsJavaScriptException();
        return;
    }

    int length = info.Length();
    if (length < 2 || !info[0].IsString() || !info[1].IsString())
    {
        Napi::TypeError::New(info.Env(), "String,String expected").ThrowAsJavaScriptException();
        return;
    }

    try
    {
        std::string candidate = info[0].As<Napi::String>().ToString();
        std::string mid = info[0].As<Napi::String>().ToString();
        mRtcPeerConnPtr->addRemoteCandidate(rtc::Candidate(candidate, mid));
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while adding remote candidate# ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

Napi::Value PeerConnectionWrapper::createDataChannel(const Napi::CallbackInfo &info)
{
    if (!mRtcPeerConnPtr)
    {
        Napi::Error::New(info.Env(), "It seems peer-connection is closed").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "Data Channel Label expected").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    try
    {
        std::string label = info[0].As<Napi::String>().ToString();
        std::shared_ptr<rtc::DataChannel> dataChannel = mRtcPeerConnPtr->createDataChannel(label);
        auto instance = DataChannelWrapper::constructor.New({Napi::External<std::shared_ptr<rtc::DataChannel>>::New(info.Env(), &dataChannel)});
        return instance;
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while creating datachannel# ") + ex.what()).ThrowAsJavaScriptException();
        return info.Env().Null();
    }
}

void PeerConnectionWrapper::onLocalDescription(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnLocalDescriptionCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}

void PeerConnectionWrapper::onLocalCandidate(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnLocalCandidateCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}

void PeerConnectionWrapper::onStateChange(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnStateChangeCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}

void PeerConnectionWrapper::onGatheringStateChange(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnGatheringStateChangeCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}

void PeerConnectionWrapper::onDataChannel(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnDataChannelCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}
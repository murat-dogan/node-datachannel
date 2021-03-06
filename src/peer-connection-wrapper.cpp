#include "peer-connection-wrapper.h"
#include "data-channel-wrapper.h"
#include <sstream>

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
         InstanceMethod("onDataChannel", &PeerConnectionWrapper::onDataChannel),
         InstanceMethod("bytesSent", &PeerConnectionWrapper::bytesSent),
         InstanceMethod("bytesReceived", &PeerConnectionWrapper::bytesReceived),
         InstanceMethod("rtt", &PeerConnectionWrapper::rtt),
         InstanceMethod("getSelectedCandidatePair", &PeerConnectionWrapper::getSelectedCandidatePair)});

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
        if (iceServers.Get(i).IsString())
            rtcConfig.iceServers.emplace_back(iceServers.Get(i).As<Napi::String>().ToString());
        else
        {
            if (!iceServers.Get(i).IsObject())
            {
                Napi::TypeError::New(env, "IceServer config should be a string Or an object").ThrowAsJavaScriptException();
                return;
            }

            Napi::Object iceServer = iceServers.Get(i).As<Napi::Object>();
            if (!iceServer.Get("hostname").IsString() || !iceServer.Get("port").IsNumber())
            {
                Napi::TypeError::New(env, "IceServer config error (hostname OR/AND port is not suitable)").ThrowAsJavaScriptException();
                return;
            }

            if (iceServer.Get("relayType").IsString() &&
                (!iceServer.Get("username").IsString() || !iceServer.Get("password").IsString()))
            {
                Napi::TypeError::New(env, "IceServer config error (username AND password is needed)").ThrowAsJavaScriptException();
                return;
            }

            if (iceServer.Get("relayType").IsString())
            {
                std::string relayTypeStr = iceServer.Get("relayType").As<Napi::String>();
                rtc::IceServer::RelayType relayType = rtc::IceServer::RelayType::TurnUdp;
                if (relayTypeStr.compare("TurnTcp") == 0)
                    relayType = rtc::IceServer::RelayType::TurnTcp;
                if (relayTypeStr.compare("TurnTls") == 0)
                    relayType = rtc::IceServer::RelayType::TurnTls;

                rtcConfig.iceServers.emplace_back(
                    rtc::IceServer(iceServer.Get("hostname").As<Napi::String>(),
                                   (uint16_t)iceServer.Get("port").As<Napi::Number>().Uint32Value(),
                                   iceServer.Get("username").As<Napi::String>(),
                                   iceServer.Get("password").As<Napi::String>(),
                                   relayType));
            }
            else
            {
                rtcConfig.iceServers.emplace_back(
                    rtc::IceServer(
                        iceServer.Get("hostname").As<Napi::String>(),
                        (uint16_t)iceServer.Get("port").As<Napi::Number>().Uint32Value()));
            }
        }
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

    // Max Message Size
    if (config.Get("maxMessageSize").IsNumber())
        rtcConfig.maxMessageSize = config.Get("maxMessageSize").As<Napi::Number>().Uint32Value();

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

    // Optional Params
    rtc::DataChannelInit init;
    if (length > 1)
    {
        if (!info[1].IsObject())
        {
            Napi::TypeError::New(env, "Data Channel Init Config expected(As Object)").ThrowAsJavaScriptException();
            return info.Env().Null();
        }

        Napi::Object initConfig = info[1].As<Napi::Object>();
        if (!initConfig.Get("negotiated").IsUndefined())
        {
            if (!initConfig.Get("negotiated").IsBoolean())
            {
                Napi::TypeError::New(env, "Wrong DataChannel Init Config (negotiated)").ThrowAsJavaScriptException();
                return info.Env().Null();
            }
            init.negotiated = initConfig.Get("negotiated").As<Napi::Boolean>();
        }

        if (!initConfig.Get("protocol").IsUndefined())
        {
            if (!initConfig.Get("protocol").IsString())
            {
                Napi::TypeError::New(env, "Wrong DataChannel Init Config (protocol)").ThrowAsJavaScriptException();
                return info.Env().Null();
            }
            init.protocol = initConfig.Get("protocol").As<Napi::String>();
        }

        if (!initConfig.Get("reliability").IsUndefined())
        {
            if (!initConfig.Get("reliability").IsObject())
            {
                Napi::TypeError::New(env, "Wrong DataChannel Init Config (reliability)").ThrowAsJavaScriptException();
                return info.Env().Null();
            }

            Napi::Object reliability = initConfig.Get("reliability").As<Napi::Object>();
            if (!reliability.Get("type").IsUndefined())
            {
                if (!reliability.Get("type").IsNumber())
                {
                    Napi::TypeError::New(env, "Wrong Reliability Config (type)").ThrowAsJavaScriptException();
                    return info.Env().Null();
                }
                switch ((int)reliability.Get("type").As<Napi::Number>())
                {
                case 0:
                    init.reliability.type = rtc::Reliability::Type::Reliable;
                    break;
                case 1:
                    init.reliability.type = rtc::Reliability::Type::Rexmit;
                    break;
                case 2:
                    init.reliability.type = rtc::Reliability::Type::Timed;
                    break;
                default:
                    Napi::TypeError::New(env, "UnKnown DataChannel Reliability Type").ThrowAsJavaScriptException();
                    return info.Env().Null();
                }
            }

            if (!reliability.Get("unordered").IsUndefined())
            {
                if (!reliability.Get("unordered").IsBoolean())
                {
                    Napi::TypeError::New(env, "Wrong reliability Config (unordered)").ThrowAsJavaScriptException();
                    return info.Env().Null();
                }
                init.reliability.unordered = reliability.Get("unordered").As<Napi::Boolean>();
            }

            if (!reliability.Get("rexmit").IsUndefined())
            {
                if (!reliability.Get("rexmit").IsNumber())
                {
                    Napi::TypeError::New(env, "Wrong Reliability Config (rexmit)").ThrowAsJavaScriptException();
                    return info.Env().Null();
                }
                switch ((int)reliability.Get("type").As<Napi::Number>())
                {
                case 1:
                    init.reliability.rexmit = reliability.Get("rexmit").As<Napi::Number>();
                    break;
                case 2:
                    init.reliability.rexmit = std::chrono::milliseconds(reliability.Get("rexmit").As<Napi::Number>());
                    break;
                }
            }
        }
    }

    try
    {
        std::string label = info[0].As<Napi::String>().ToString();
        std::shared_ptr<rtc::DataChannel> dataChannel = mRtcPeerConnPtr->createDataChannel(label, init);
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

Napi::Value PeerConnectionWrapper::bytesSent(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mRtcPeerConnPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(env, mRtcPeerConnPtr->bytesSent());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value PeerConnectionWrapper::bytesReceived(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mRtcPeerConnPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(env, mRtcPeerConnPtr->bytesReceived());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value PeerConnectionWrapper::rtt(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mRtcPeerConnPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(env, mRtcPeerConnPtr->rtt().value_or(std::chrono::milliseconds(-1)).count());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), -1);
    }
}

Napi::Value PeerConnectionWrapper::getSelectedCandidatePair(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mRtcPeerConnPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        rtc::Candidate local, remote;
        if (!mRtcPeerConnPtr->getSelectedCandidatePair(&local, &remote))
            return info.Env().Null();

        Napi::Object retvalue = Napi::Object::New(env);
        Napi::Object localObj = Napi::Object::New(env);
        Napi::Object remoteObj = Napi::Object::New(env);

        localObj.Set("address", local.address().value_or("?"));
        localObj.Set("port", local.port().value_or(0));
        localObj.Set("type", candidateTypeToString(local.type()));
        localObj.Set("transportType", candidateTransportTypeToString(local.transportType()));

        remoteObj.Set("address", remote.address().value_or("?"));
        remoteObj.Set("port", remote.port().value_or(0));
        remoteObj.Set("type", candidateTypeToString(remote.type()));
        remoteObj.Set("transportType", candidateTransportTypeToString(remote.transportType()));

        retvalue.Set("local", localObj);
        retvalue.Set("remote", remoteObj);

        return retvalue;
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), -1);
    }
}

std::string PeerConnectionWrapper::candidateTypeToString(const rtc::Candidate::Type &type)
{
    switch (type)
    {
    case rtc::Candidate::Type::Host:
        return "host";
    case rtc::Candidate::Type::PeerReflexive:
        return "prflx";
    case rtc::Candidate::Type::ServerReflexive:
        return "srflx";
    case rtc::Candidate::Type::Relayed:
        return "relay";
    default:
        return "unknown";
    }
}

std::string PeerConnectionWrapper::candidateTransportTypeToString(const rtc::Candidate::TransportType &transportType)
{
    switch (transportType)
    {
    case rtc::Candidate::TransportType::Udp:
        return "UDP";
    case rtc::Candidate::TransportType::TcpActive:
        return "TCP_active";
    case rtc::Candidate::TransportType::TcpPassive:
        return "TCP_passive";
    case rtc::Candidate::TransportType::TcpSo:
        return "TCP_so";
    case rtc::Candidate::TransportType::TcpUnknown:
        return "TCP_unknown";
    default:
        return "unknown";
    }
}

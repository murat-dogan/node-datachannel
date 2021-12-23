#include "media-track-wrapper.h"
#include "media-direction.h"
#include "media-rtcpreceivingsession-wrapper.h"

Napi::FunctionReference TrackWrapper::constructor;
std::unordered_set<TrackWrapper *> TrackWrapper::instances;

Napi::Object TrackWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "Track",
        {
            InstanceMethod("direction", &TrackWrapper::direction),
            InstanceMethod("mid", &TrackWrapper::mid),
            InstanceMethod("close", &TrackWrapper::close),
            InstanceMethod("sendMessage", &TrackWrapper::sendMessage),
            InstanceMethod("sendMessageBinary", &TrackWrapper::sendMessageBinary),
            InstanceMethod("isOpen", &TrackWrapper::isOpen),
            InstanceMethod("isClosed", &TrackWrapper::isClosed),
            InstanceMethod("availableAmount", &TrackWrapper::availableAmount),
            InstanceMethod("bufferedAmount", &TrackWrapper::bufferedAmount),
            InstanceMethod("maxMessageSize", &TrackWrapper::maxMessageSize),
            InstanceMethod("setBufferedAmountLowThreshold", &TrackWrapper::setBufferedAmountLowThreshold),
            InstanceMethod("requestKeyframe", &TrackWrapper::requestKeyframe),
            InstanceMethod("setMediaHandler", &TrackWrapper::setMediaHandler),
            InstanceMethod("onOpen", &TrackWrapper::onOpen),
            InstanceMethod("onClosed", &TrackWrapper::onClosed),
            InstanceMethod("onError", &TrackWrapper::onError),
            InstanceMethod("onAvailable", &TrackWrapper::onAvailable),
            InstanceMethod("onBufferedAmountLow", &TrackWrapper::onBufferedAmountLow),
            InstanceMethod("onMessage", &TrackWrapper::onMessage),
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("Track", func);
    return exports;
}

TrackWrapper::TrackWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<TrackWrapper>(info)
{
    mTrackPtr = *(info[0].As<Napi::External<std::shared_ptr<rtc::Track>>>().Data());

    instances.insert(this);
}

TrackWrapper::~TrackWrapper()
{
    doClose();
}

void TrackWrapper::doClose()
{
    instances.erase(this);

    if (mTrackPtr)
    {
        try
        {
            mOnOpenCallback.reset();
            mOnClosedCallback.reset();
            mOnErrorCallback.reset();
            mOnAvailableCallback.reset();
            mOnBufferedAmountLowCallback.reset();
            mOnMessageCallback.reset();

            mTrackPtr->close();
            mTrackPtr.reset();
        }
        catch (std::exception &ex)
        {
            std::cout << std::string("libdatachannel error while closing track# ") + ex.what() << std::endl;
            return;
        }
    }
}

Napi::Value TrackWrapper::direction(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, directionToStr(mTrackPtr->direction()));
}

Napi::Value TrackWrapper::mid(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, mTrackPtr->mid());
}

void TrackWrapper::close(const Napi::CallbackInfo &info)
{
    mTrackPtr->close();
}

Napi::Value TrackWrapper::sendMessage(const Napi::CallbackInfo &info)
{
    if (!mTrackPtr)
    {
        Napi::Error::New(info.Env(), "It seems track is destroyed!").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    // Allow call with NULL
    if (length < 1 || (!info[0].IsString() && !info[0].IsNull()))
    {
        Napi::TypeError::New(env, "String or Null expected").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    try
    {
        return Napi::Boolean::New(info.Env(), mTrackPtr->send(info[0].As<Napi::String>().ToString()));
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while sending track msg# ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Boolean::New(info.Env(), false);
    }
}

Napi::Value TrackWrapper::sendMessageBinary(const Napi::CallbackInfo &info)
{
    if (!mTrackPtr)
    {
        Napi::Error::New(info.Env(), "It seems track is destroyed!").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsBuffer())
    {
        Napi::TypeError::New(env, "Buffer expected").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    try
    {
        Napi::Uint8Array buffer = info[0].As<Napi::Uint8Array>();
        return Napi::Boolean::New(info.Env(), mTrackPtr->send((std::byte *)buffer.Data(), buffer.ByteLength()));
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while sending track msg# ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Boolean::New(info.Env(), false);
    }
}

Napi::Value TrackWrapper::isOpen(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, mTrackPtr->isOpen());
}

Napi::Value TrackWrapper::isClosed(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, mTrackPtr->isClosed());
}

Napi::Value TrackWrapper::availableAmount(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mTrackPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(info.Env(), mTrackPtr->availableAmount());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value TrackWrapper::bufferedAmount(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mTrackPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(info.Env(), mTrackPtr->bufferedAmount());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value TrackWrapper::maxMessageSize(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (!mTrackPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(info.Env(), mTrackPtr->maxMessageSize());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

void TrackWrapper::setBufferedAmountLowThreshold(const Napi::CallbackInfo &info)
{
    if (!mTrackPtr)
    {
        Napi::Error::New(info.Env(), "It seems data-channel is destroyed!").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsNumber())
    {
        Napi::TypeError::New(env, "Number expected").ThrowAsJavaScriptException();
        return;
    }

    try
    {
        mTrackPtr->setBufferedAmountLowThreshold(info[0].ToNumber().Uint32Value());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error# ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

Napi::Value TrackWrapper::requestKeyframe(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, mTrackPtr->requestKeyframe());
}

void TrackWrapper::setMediaHandler(const Napi::CallbackInfo &info)
{
    if (!mTrackPtr)
    {
        Napi::Error::New(info.Env(), "It seems track is destroyed!").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsObject())
    {
        Napi::TypeError::New(env, "Mediahandler class instance expected").ThrowAsJavaScriptException();
        return;
    }

    RtcpReceivingSessionWrapper *handler = Napi::ObjectWrap<RtcpReceivingSessionWrapper>::Unwrap(info[0].As<Napi::Object>());
    mTrackPtr->setMediaHandler(handler->getSessionInstance());
}

void TrackWrapper::onOpen(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnOpenCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mTrackPtr->onOpen([&]()
                      {
        if (mOnOpenCallback)
            mOnOpenCallback->call([this](Napi::Env env, std::vector<napi_value> &args) {
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            }); });
}

void TrackWrapper::onClosed(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnClosedCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mTrackPtr->onClosed([&]()
                        {
        if (mOnClosedCallback)
            mOnClosedCallback->call([this](Napi::Env env, std::vector<napi_value> &args) {
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            }); });
}

void TrackWrapper::onError(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnErrorCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mTrackPtr->onError([&](const std::string &error)
                       {
        if (mOnErrorCallback)
            mOnErrorCallback->call([this, error](Napi::Env env, std::vector<napi_value> &args) {
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {Napi::String::New(env, error)};
            }); });
}

void TrackWrapper::onAvailable(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnAvailableCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mTrackPtr->onAvailable([&]()
                           {
        if (mOnAvailableCallback)
            mOnAvailableCallback->call([this](Napi::Env env, std::vector<napi_value> &args) {
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            }); });
}

void TrackWrapper::onBufferedAmountLow(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnBufferedAmountLowCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mTrackPtr->onBufferedAmountLow([&]()
                                   {
        if (mOnBufferedAmountLowCallback)
            mOnBufferedAmountLowCallback->call([this](Napi::Env env, std::vector<napi_value> &args) {
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            }); });
}

void TrackWrapper::onMessage(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnMessageCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mTrackPtr->onMessage([&](const std::variant<rtc::binary, std::string> &message)
                         {
                             std::cout << 1 << std::endl;
        if (mOnMessageCallback)
            mOnMessageCallback->call([this, message](Napi::Env env, std::vector<napi_value> &args) {
                // Check the peer connection is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                Napi::Object payload = Napi::Object::New(env);
                if (std::holds_alternative<std::string>(message))
                {
                    args = {Napi::String::New(env, std::get<std::string>(message))};
                }
                else
                {
                    args = {Napi::Buffer<std::byte>::Copy(env, std::get<rtc::binary>(message).data(), std::get<rtc::binary>(message).size())};
                }
            }); });
}
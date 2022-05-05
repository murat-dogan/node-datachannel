#include "data-channel-wrapper.h"

Napi::FunctionReference DataChannelWrapper::constructor;
std::unordered_set<DataChannelWrapper *> DataChannelWrapper::instances;

void DataChannelWrapper::CloseAll()
{
    auto copy(instances);
    for (auto inst : copy)
        inst->doClose();
}

Napi::Object DataChannelWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "DataChannel",
        {
            InstanceMethod("close", &DataChannelWrapper::close),
            InstanceMethod("getLabel", &DataChannelWrapper::getLabel),
            InstanceMethod("getId", &DataChannelWrapper::getId),
            InstanceMethod("getProtocol", &DataChannelWrapper::getProtocol),
            InstanceMethod("sendMessage", &DataChannelWrapper::sendMessage),
            InstanceMethod("sendMessageBinary", &DataChannelWrapper::sendMessageBinary),
            InstanceMethod("isOpen", &DataChannelWrapper::isOpen),
            InstanceMethod("bufferedAmount", &DataChannelWrapper::bufferedAmount),
            InstanceMethod("maxMessageSize", &DataChannelWrapper::maxMessageSize),
            InstanceMethod("setBufferedAmountLowThreshold", &DataChannelWrapper::setBufferedAmountLowThreshold),
            InstanceMethod("onOpen", &DataChannelWrapper::onOpen),
            InstanceMethod("onClosed", &DataChannelWrapper::onClosed),
            InstanceMethod("onError", &DataChannelWrapper::onError),
            InstanceMethod("onBufferedAmountLow", &DataChannelWrapper::onBufferedAmountLow),
            InstanceMethod("onMessage", &DataChannelWrapper::onMessage),
        });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("DataChannel", func);
    return exports;
}

DataChannelWrapper::DataChannelWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<DataChannelWrapper>(info)
{
    mDataChannelPtr = *(info[0].As<Napi::External<std::shared_ptr<rtc::DataChannel>>>().Data());

    instances.insert(this);
}

DataChannelWrapper::~DataChannelWrapper()
{
    doClose();
}

void DataChannelWrapper::doClose()
{
    if (mDataChannelPtr)
    {
        try
        {
            mDataChannelPtr->close();
            mDataChannelPtr.reset();
        }
        catch (std::exception &ex)
        {
            std::cerr << std::string("libdatachannel error while closing data channel: ") + ex.what() << std::endl;
            return;
        }
    }

    mOnOpenCallback.reset();
    mOnClosedCallback.reset();
    mOnErrorCallback.reset();
    mOnBufferedAmountLowCallback.reset();
    mOnMessageCallback.reset();

    instances.erase(this);
}

void DataChannelWrapper::close(const Napi::CallbackInfo &info)
{
    doClose();
}

Napi::Value DataChannelWrapper::getLabel(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "getLabel() called on destroyed channel").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    return Napi::String::New(info.Env(), mDataChannelPtr->label());
}

Napi::Value DataChannelWrapper::getId(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "getId() called on destroyed channel").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    return Napi::Number::New(info.Env(), mDataChannelPtr->id());
}

Napi::Value DataChannelWrapper::getProtocol(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "getProtocol() called on destroyed channel").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    return Napi::String::New(info.Env(), mDataChannelPtr->protocol());
}

Napi::Value DataChannelWrapper::sendMessage(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "sendMessage() called on destroyed channel").ThrowAsJavaScriptException();
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
        return Napi::Boolean::New(info.Env(), mDataChannelPtr->send(info[0].As<Napi::String>().ToString()));
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while sending data channel message: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Boolean::New(info.Env(), false);
    }
}

Napi::Value DataChannelWrapper::sendMessageBinary(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "sendMessagBinary() called on destroyed channel").ThrowAsJavaScriptException();
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
        return Napi::Boolean::New(info.Env(), mDataChannelPtr->send((std::byte *)buffer.Data(), buffer.ByteLength()));
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error while sending data channel message: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Boolean::New(info.Env(), false);
    }
}

Napi::Value DataChannelWrapper::isOpen(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (!mDataChannelPtr)
    {
        return Napi::Boolean::New(info.Env(), false);
    }

    try
    {
        return Napi::Boolean::New(info.Env(), mDataChannelPtr->isOpen());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Boolean::New(info.Env(), false);
    }
}

Napi::Value DataChannelWrapper::bufferedAmount(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (!mDataChannelPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(info.Env(), mDataChannelPtr->bufferedAmount());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

Napi::Value DataChannelWrapper::maxMessageSize(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (!mDataChannelPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }

    try
    {
        return Napi::Number::New(info.Env(), mDataChannelPtr->maxMessageSize());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return Napi::Number::New(info.Env(), 0);
    }
}

void DataChannelWrapper::setBufferedAmountLowThreshold(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "setBufferedAmountLowThreshold() called on destroyed channel").ThrowAsJavaScriptException();
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
        mDataChannelPtr->setBufferedAmountLowThreshold(info[0].ToNumber().Uint32Value());
    }
    catch (std::exception &ex)
    {
        Napi::Error::New(env, std::string("libdatachannel error: ") + ex.what()).ThrowAsJavaScriptException();
        return;
    }
}

void DataChannelWrapper::onOpen(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "onOpen() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnOpenCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mDataChannelPtr->onOpen([&]() {
        if (mOnOpenCallback)
            mOnOpenCallback->call([this](Napi::Env env, std::vector<napi_value> &args) {
                // Check the data channel is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            }); });
}

void DataChannelWrapper::onClosed(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "onClosed() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnClosedCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mDataChannelPtr->onClosed([&]() {
        if (mOnClosedCallback)
            mOnClosedCallback->call([this](Napi::Env env, std::vector<napi_value> &args) {
                // Do not check if the data channel has been closed here

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            }); });
}

void DataChannelWrapper::onError(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "onError() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnErrorCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mDataChannelPtr->onError([&](std::string error) {
        if (mOnErrorCallback)
            mOnErrorCallback->call([this, error = std::move(error)](Napi::Env env, std::vector<napi_value> &args) {
                // Check the data channel is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {Napi::String::New(env, error)};
            }); });
}

void DataChannelWrapper::onBufferedAmountLow(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "onBufferedAmountLow() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnBufferedAmountLowCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mDataChannelPtr->onBufferedAmountLow([&]() {
        if (mOnBufferedAmountLowCallback)
            mOnBufferedAmountLowCallback->call([this](Napi::Env env, std::vector<napi_value> &args) {
                // Check the data channel is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            }); });
}

void DataChannelWrapper::onMessage(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::Error::New(info.Env(), "onMessage() called on destroyed channel").ThrowAsJavaScriptException();
        return;
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnMessageCallback = std::make_unique<ThreadSafeCallback>(info[0].As<Napi::Function>());

    mDataChannelPtr->onMessage([&](std::variant<rtc::binary, std::string> message) {
        if (mOnMessageCallback)
            mOnMessageCallback->call([this, message = std::move(message)](Napi::Env env, std::vector<napi_value> &args) {
                // Check the data channel is not closed
                if(instances.find(this) == instances.end())
                    throw ThreadSafeCallback::CancelException();

                // This will run in main thread and needs to construct the
                // arguments for the call
                if (std::holds_alternative<std::string>(message))
                {
                    args = {Napi::String::New(env, std::get<std::string>(message))};
                }
                else
                {
                    auto bin = std::get<rtc::binary>(std::move(message));
                    args = {Napi::Buffer<std::byte>::Copy(env, bin.data(), bin.size())};
                }
            }); });
}

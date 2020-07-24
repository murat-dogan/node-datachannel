#include "data-channel-wrapper.h"

Napi::FunctionReference DataChannelWrapper::constructor;

Napi::Object DataChannelWrapper::Init(Napi::Env env, Napi::Object exports)
{
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(
        env,
        "DataChannel",
        {InstanceMethod("close", &DataChannelWrapper::close),
         InstanceMethod("getLabel", &DataChannelWrapper::getLabel),
         InstanceMethod("sendMessage", &DataChannelWrapper::sendMessage),
         InstanceMethod("isOpen", &DataChannelWrapper::isOpen),
         InstanceMethod("availableAmount", &DataChannelWrapper::availableAmount),
         InstanceMethod("bufferedAmount", &DataChannelWrapper::bufferedAmount),
         InstanceMethod("maxMessageSize", &DataChannelWrapper::maxMessageSize),
         InstanceMethod("onOpen", &DataChannelWrapper::onOpen),
         InstanceMethod("onClosed", &DataChannelWrapper::onClosed),
         InstanceMethod("onError", &DataChannelWrapper::onError),
         InstanceMethod("onAvailable", &DataChannelWrapper::onAvailable),
         InstanceMethod("onBufferedAmountLow", &DataChannelWrapper::onBufferedAmountLow),
         InstanceMethod("onMessage", &DataChannelWrapper::onMessage)});

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("DataChannel", func);
    return exports;
}

DataChannelWrapper::DataChannelWrapper(const Napi::CallbackInfo &info) : Napi::ObjectWrap<DataChannelWrapper>(info)
{
    mDataChannelPtr = *(info[0].As<Napi::External<std::shared_ptr<rtc::DataChannel>>>().Data());

    // Signals
    mDataChannelPtr->onOpen([&]() {
        if (mOnOpenCallback)
            mOnOpenCallback->call([](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            });
    });

    mDataChannelPtr->onClosed([&]() {
        if (mOnClosedCallback)
            mOnClosedCallback->call([](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            });
    });

    mDataChannelPtr->onError([&](const std::string &error) {
        if (mOnErrorCallback)
            mOnErrorCallback->call([error](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {Napi::String::New(env, error)};
            });
    });

    mDataChannelPtr->onAvailable([&]() {
        if (mOnAvailableCallback)
            mOnAvailableCallback->call([](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            });
    });

    mDataChannelPtr->onBufferedAmountLow([&]() {
        if (mOnBufferedAmountLowCallback)
            mOnBufferedAmountLowCallback->call([](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                args = {};
            });
    });

    mDataChannelPtr->onMessage([&](const std::variant<rtc::binary, std::string> &message) {
        if (mOnMessageCallback)
            mOnMessageCallback->call([message](Napi::Env env, std::vector<napi_value> &args) {
                // This will run in main thread and needs to construct the
                // arguments for the call
                Napi::Object payload = Napi::Object::New(env);
                // FIX ME
                // Binary Message?
                args = {Napi::String::New(env, std::get<std::string>(message))};
            });
    });
}

DataChannelWrapper::~DataChannelWrapper()
{
    if (mDataChannelPtr)
    {
        mDataChannelPtr->close();
        mDataChannelPtr.reset();
    }
}

void DataChannelWrapper::close(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::TypeError::New(info.Env(), "It seems data-channel is destroyed!").ThrowAsJavaScriptException();
        return;
    }

    mDataChannelPtr->close();
    mDataChannelPtr.reset();
}

Napi::Value DataChannelWrapper::getLabel(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::TypeError::New(info.Env(), "It seems data-channel is destroyed!").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    return Napi::String::New(info.Env(), mDataChannelPtr->label());
}

Napi::Value DataChannelWrapper::sendMessage(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        Napi::TypeError::New(info.Env(), "It seems data-channel is destroyed!").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsString())
    {
        Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
        return info.Env().Null();
    }

    return Napi::Boolean::New(info.Env(), mDataChannelPtr->send(info[0].As<Napi::String>().ToString()));
}

Napi::Value DataChannelWrapper::isOpen(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        return Napi::Boolean::New(info.Env(), false);
    }

    return Napi::Boolean::New(info.Env(), mDataChannelPtr->isOpen());
}

Napi::Value DataChannelWrapper::availableAmount(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }
    return Napi::Number::New(info.Env(), mDataChannelPtr->availableAmount());
}

Napi::Value DataChannelWrapper::bufferedAmount(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }
    return Napi::Number::New(info.Env(), mDataChannelPtr->bufferedAmount());
}

Napi::Value DataChannelWrapper::maxMessageSize(const Napi::CallbackInfo &info)
{
    if (!mDataChannelPtr)
    {
        return Napi::Number::New(info.Env(), 0);
    }
    return Napi::Number::New(info.Env(), mDataChannelPtr->maxMessageSize());
}

void DataChannelWrapper::onOpen(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnOpenCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}

void DataChannelWrapper::onClosed(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnClosedCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}

void DataChannelWrapper::onError(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnErrorCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}

void DataChannelWrapper::onAvailable(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnAvailableCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}

void DataChannelWrapper::onBufferedAmountLow(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnBufferedAmountLowCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}

void DataChannelWrapper::onMessage(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    int length = info.Length();

    if (length < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected").ThrowAsJavaScriptException();
        return;
    }

    // Callback
    mOnMessageCallback = std::make_shared<ThreadSafeCallback>(info[0].As<Napi::Function>());
}
#include "thread-safe-callback.h"

#include <stdexcept>

const char *ThreadSafeCallback::CancelException::what() const throw()
{
    return "ThreadSafeCallback cancelled";
}

ThreadSafeCallback::ThreadSafeCallback(Napi::Function callback)
{
    if (!callback.IsFunction())
        throw Napi::Error::New(callback.Env(), "Callback must be a function");

    Napi::Env env = callback.Env();

    receiver = Napi::Persistent(static_cast<Napi::Value>(Napi::Object::New(env)));
    tsfn = tsfn_t::New(env,
                       std::move(callback),
                       "ThreadSafeCallback callback",
                       0, 1, &receiver);
}

ThreadSafeCallback::~ThreadSafeCallback()
{
    tsfn.Abort();
}

void ThreadSafeCallback::call(arg_func_t argFunc, cleanup_func_t cleanupFunc)
{
    CallbackData *data = new CallbackData{std::move(argFunc), std::move(cleanupFunc)};
    if (tsfn.BlockingCall(data) != napi_ok)
    {
        delete data;
        throw std::runtime_error("Failed to call JavaScript callback");
    }
}

void ThreadSafeCallback::callbackFunc(Napi::Env env,
                                      Napi::Function callback,
                                      Napi::Reference<Napi::Value> *context,
                                      CallbackData *data)
{
    // if env is gone this could mean cb fn has changed. See issue#176
    if (!data || !env)
        return;

    arg_vector_t args;
    arg_func_t argFunc(std::move(data->argFunc));
    cleanup_func_t cleanup(std::move(data->cleanupFunc));
    delete data;

    try
    {
        argFunc(env, args);
    }
    catch (CancelException &)
    {
        return;
    }

    if (env && callback)
    {
        callback.Call(context->Value(), args);
        cleanup();
    }
}

#ifndef THREAD_SAFE_CALLBACK_H
#define THREAD_SAFE_CALLBACK_H

#include <napi.h>

#include <vector>
#include <functional>

class ThreadSafeCallback
{
public:
    using arg_vector_t = std::vector<napi_value>;
    using arg_func_t = std::function<void(napi_env, arg_vector_t &)>;
    using cleanup_func_t = std::function<void()>;

    ThreadSafeCallback(Napi::Function callback);
    ~ThreadSafeCallback();

    ThreadSafeCallback(const ThreadSafeCallback &) = delete;
    ThreadSafeCallback(ThreadSafeCallback &&) = delete;

    ThreadSafeCallback &operator=(const ThreadSafeCallback &) = delete;
    ThreadSafeCallback &operator=(ThreadSafeCallback &&) = delete;

    void call(arg_func_t argFunc, cleanup_func_t cleanupFunc = []() {});

    class CancelException : public std::exception
    {
        const char *what() const throw();
    };

private:
    struct CallbackData
    {
        arg_func_t argFunc;
        cleanup_func_t cleanupFunc;
    };

    static void callbackFunc(Napi::Env env,
                             Napi::Function callback,
                             Napi::Reference<Napi::Value> *context,
                             CallbackData *data);

    using tsfn_t = Napi::TypedThreadSafeFunction<Napi::Reference<Napi::Value>, CallbackData, callbackFunc>;

    Napi::Reference<Napi::Value> receiver;
    tsfn_t tsfn;
};

#endif // THREAD_SAFE_CALLBACK_H

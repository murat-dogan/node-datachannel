#include <napi.h>
#include "rtc-wrapper.h"
#include "peer-connection-wrapper.h"
#include "data-channel-wrapper.h"
#include "ice-udp-mux-listener-wrapper.h"

#if RTC_ENABLE_MEDIA == 1
#include "media-rtcpreceivingsession-wrapper.h"
#include "media-track-wrapper.h"
#include "media-video-wrapper.h"
#include "media-audio-wrapper.h"
#endif

#if RTC_ENABLE_WEBSOCKET == 1
#include "web-socket-wrapper.h"
#include "web-socket-server-wrapper.h"
#endif

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    RtcWrapper::Init(env, exports);

#if RTC_ENABLE_MEDIA == 1
    RtcpReceivingSessionWrapper::Init(env, exports);
    TrackWrapper::Init(env, exports);
    VideoWrapper::Init(env, exports);
    AudioWrapper::Init(env, exports);
#endif

    DataChannelWrapper::Init(env, exports);
    IceUdpMuxListenerWrapper::Init(env, exports);
    PeerConnectionWrapper::Init(env, exports);

#if RTC_ENABLE_WEBSOCKET == 1
    WebSocketWrapper::Init(env, exports);
    WebSocketServerWrapper::Init(env, exports);
#endif

    return exports;
}

NODE_API_MODULE(nodeDataChannel, InitAll)

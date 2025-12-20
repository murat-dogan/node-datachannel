#include "media-mediahandler-helper.h"
#include "media-av1rtppacketizer-wrapper.h"
#include "media-h264rtppacketizer-wrapper.h"
#include "media-h265rtppacketizer-wrapper.h"
#include "media-pacinghandler-wrapper.h"
#include "media-rtcpnackresponder-wrapper.h"
#include "media-rtcpreceivingsession-wrapper.h"
#include "media-rtcpsrreporter-wrapper.h"
#include "media-rtppacketizer-wrapper.h"

std::shared_ptr<rtc::MediaHandler> asMediaHandler(const Napi::Object &val)
{
  std::shared_ptr<rtc::MediaHandler> mediaHandler;
  if (val.InstanceOf(AV1RtpPacketizerWrapper::constructor.Value()))
    mediaHandler = AV1RtpPacketizerWrapper::Unwrap(val)->getPacketizerInstance();
  else if (val.InstanceOf(H264RtpPacketizerWrapper::constructor.Value()))
    mediaHandler = H264RtpPacketizerWrapper::Unwrap(val)->getPacketizerInstance();
  else if (val.InstanceOf(H265RtpPacketizerWrapper::constructor.Value()))
    mediaHandler = H265RtpPacketizerWrapper::Unwrap(val)->getPacketizerInstance();
  else if (val.InstanceOf(PacingHandlerWrapper::constructor.Value()))
    mediaHandler = PacingHandlerWrapper::Unwrap(val)->getHandlerInstance();
  else if (val.InstanceOf(RtcpNackResponderWrapper::constructor.Value()))
    mediaHandler = RtcpNackResponderWrapper::Unwrap(val)->getResponderInstance();
  else if (val.InstanceOf(RtcpReceivingSessionWrapper::constructor.Value()))
    mediaHandler = RtcpReceivingSessionWrapper::Unwrap(val)->getSessionInstance();
  else if (val.InstanceOf(RtcpSrReporterWrapper::constructor.Value()))
    mediaHandler = RtcpSrReporterWrapper::Unwrap(val)->getReporterInstance();
  else if (val.InstanceOf(RtpPacketizerWrapper::constructor.Value()))
    mediaHandler = RtpPacketizerWrapper::Unwrap(val)->getPacketizerInstance();
  return mediaHandler;
}

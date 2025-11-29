#ifndef MEDIA_AV1PACKETIZATION_H
#define MEDIA_AV1PACKETIZATION_H

#include <napi.h>
#include <rtc/rtc.hpp>
#include <optional>

std::optional<rtc::AV1RtpPacketizer::Packetization> strToPacketization(const std::string &pktAsStr);
std::string packetizationToStr(rtc::AV1RtpPacketizer::Packetization pkt);

#endif // MEDIA_AV1PACKETIZATION_H

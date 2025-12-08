#include "media-av1packetization.h"

using Packetization = rtc::AV1RtpPacketizer::Packetization;

std::optional<Packetization> strToPacketization(const std::string &packAsStr)
{
  if (packAsStr == "Obu")
    return Packetization::Obu;
  if (packAsStr == "TemporalUnit")
    return Packetization::TemporalUnit;
  return {};
}

std::string packetizationToStr(rtc::AV1RtpPacketizer::Packetization pack)
{
  switch (pack)
  {
  case Packetization::Obu:
    return "Obu";
  case Packetization::TemporalUnit:
    return "TemporalUnit";
  }
  return "Unknown";
}

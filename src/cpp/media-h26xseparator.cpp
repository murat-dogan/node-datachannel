#include "media-h26xseparator.h"

using Separator = rtc::NalUnit::Separator;

std::optional<Separator> strToSeparator(const std::string &sepAsStr)
{
  if (sepAsStr == "Length")
    return Separator::Length;
  if (sepAsStr == "ShortStartSequence")
    return Separator::ShortStartSequence;
  if (sepAsStr == "LongStartSequence")
    return Separator::LongStartSequence;
  if (sepAsStr == "StartSequence")
    return Separator::StartSequence;
  return {};
}

std::string separatorToStr(rtc::NalUnit::Separator sep)
{
  switch (sep)
  {
  case Separator::Length:
    return "Length";
  case Separator::ShortStartSequence:
    return "ShortStartSequence";
  case Separator::LongStartSequence:
    return "LongStartSequence";
  case Separator::StartSequence:
    return "StartSequence";
  }
  return "Unknown";
}

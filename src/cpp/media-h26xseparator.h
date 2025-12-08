#ifndef MEDIA_H26XSEPARATOR_H
#define MEDIA_H26XSEPARATOR_H

#include <napi.h>
#include <rtc/rtc.hpp>
#include <optional>

std::optional<rtc::NalUnit::Separator> strToSeparator(const std::string &sepAsStr);
std::string separatorToStr(rtc::NalUnit::Separator sep);

#endif // MEDIA_H26XSEPARATOR_H

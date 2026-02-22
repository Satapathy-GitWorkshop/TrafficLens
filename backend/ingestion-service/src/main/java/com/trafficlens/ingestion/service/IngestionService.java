package com.trafficlens.ingestion.service;

import com.trafficlens.ingestion.dto.EventRequest;
import com.trafficlens.ingestion.model.Event;
import com.trafficlens.ingestion.repository.EventRepository;
import com.trafficlens.ingestion.repository.SiteRepository;
import eu.bitwalker.useragentutils.UserAgent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngestionService {

    private final EventRepository eventRepository;
    private final SiteRepository siteRepository;

    public void processEvent(EventRequest request, String ipAddress, String userAgentString) {
        // Validate site key
        if (!siteRepository.existsBySiteKey(request.getSiteKey())) {
            log.warn("Unknown site key: {}", request.getSiteKey());
            return;
        }

        // Parse user agent
        UserAgent userAgent = UserAgent.parseUserAgentString(userAgentString);
        String browser = userAgent.getBrowser().getName();
        String os = userAgent.getOperatingSystem().getName();
        String deviceType = detectDeviceType(userAgent);

        Event event = Event.builder()
                .siteKey(request.getSiteKey())
                .eventType(request.getEventType() != null ? request.getEventType() : "pageview")
                .url(request.getUrl())
                .referrer(request.getReferrer())
                .userAgent(userAgentString)
                .ipAddress(anonymizeIp(ipAddress))
                .deviceType(deviceType)
                .browser(browser)
                .os(os)
                .sessionId(request.getSessionId())
                .visitorId(request.getVisitorId())
                .utmSource(request.getUtmSource())
                .utmMedium(request.getUtmMedium())
                .utmCampaign(request.getUtmCampaign())
                .customEventName(request.getCustomEventName())
                .customEventData(request.getCustomEventData())
                .scrollDepth(request.getScrollDepth())
                .durationSeconds(request.getDurationSeconds())
                .country("Unknown") // In production, use GeoIP library
                .city("Unknown")
                .build();

        eventRepository.save(event);
        log.debug("Event saved: {} for site: {}", event.getEventType(), event.getSiteKey());
    }

    private String detectDeviceType(UserAgent userAgent) {
        String osName = userAgent.getOperatingSystem().getName().toLowerCase();
        if (osName.contains("android") || osName.contains("ios") || osName.contains("iphone") || osName.contains("ipad")) {
            if (osName.contains("ipad") || osName.contains("tablet")) return "tablet";
            return "mobile";
        }
        return "desktop";
    }

    private String anonymizeIp(String ip) {
        if (ip == null) return null;
        // GDPR-compliant IP anonymization - remove last octet
        int lastDot = ip.lastIndexOf('.');
        if (lastDot > 0) {
            return ip.substring(0, lastDot) + ".0";
        }
        return ip;
    }
}

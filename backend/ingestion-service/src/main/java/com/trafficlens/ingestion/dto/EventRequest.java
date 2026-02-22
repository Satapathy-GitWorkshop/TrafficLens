package com.trafficlens.ingestion.dto;

import lombok.Data;
import java.util.Map;

@Data
public class EventRequest {
    private String siteKey;
    private String eventType; // pageview, click, scroll, custom, session_end
    private String url;
    private String referrer;
    private String sessionId;
    private String visitorId;
    private String utmSource;
    private String utmMedium;
    private String utmCampaign;
    private String customEventName;
    private Map<String, Object> customEventData;
    private Integer scrollDepth;
    private Integer durationSeconds;
    private String timezone;
    private String language;
    private Integer screenWidth;
    private Integer screenHeight;
}

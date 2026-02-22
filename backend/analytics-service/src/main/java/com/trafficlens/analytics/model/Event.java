package com.trafficlens.analytics.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
@Data
public class Event {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "site_key")
    private String siteKey;

    @Column(name = "event_type")
    private String eventType;

    private String url;
    private String referrer;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "ip_address")
    private String ipAddress;

    private String country;
    private String city;

    @Column(name = "device_type")
    private String deviceType;

    private String browser;
    private String os;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "visitor_id")
    private String visitorId;

    @Column(name = "utm_source")
    private String utmSource;

    @Column(name = "utm_medium")
    private String utmMedium;

    @Column(name = "utm_campaign")
    private String utmCampaign;

    @Column(name = "scroll_depth")
    private Integer scrollDepth;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

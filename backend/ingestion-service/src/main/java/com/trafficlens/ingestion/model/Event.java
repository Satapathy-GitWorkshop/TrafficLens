package com.trafficlens.ingestion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "site_key", nullable = false)
    private String siteKey;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "url", length = 2048)
    private String url;

    @Column(name = "referrer", length = 2048)
    private String referrer;

    @Column(name = "user_agent", length = 512)
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

    @Column(name = "custom_event_name")
    private String customEventName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_event_data", columnDefinition = "jsonb")
    private Map<String, Object> customEventData;

    @Column(name = "scroll_depth")
    private Integer scrollDepth;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

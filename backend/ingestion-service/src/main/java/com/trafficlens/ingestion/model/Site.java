package com.trafficlens.ingestion.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sites")
@Data
public class Site {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;

    private String name;
    private String domain;

    @Column(name = "site_key", unique = true)
    private String siteKey;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

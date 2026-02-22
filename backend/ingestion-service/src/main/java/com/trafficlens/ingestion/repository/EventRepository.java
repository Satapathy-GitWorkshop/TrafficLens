package com.trafficlens.ingestion.repository;

import com.trafficlens.ingestion.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    long countBySiteKeyAndCreatedAtBetween(String siteKey, LocalDateTime from, LocalDateTime to);

    @Query("SELECT COUNT(DISTINCT e.visitorId) FROM Event e WHERE e.siteKey = :siteKey AND e.createdAt BETWEEN :from AND :to")
    long countDistinctVisitorsBySiteKeyAndCreatedAtBetween(String siteKey, LocalDateTime from, LocalDateTime to);
}

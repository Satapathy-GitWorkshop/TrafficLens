package com.trafficlens.ingestion.repository;

import com.trafficlens.ingestion.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface SiteRepository extends JpaRepository<Site, UUID> {
    Optional<Site> findBySiteKey(String siteKey);
    boolean existsBySiteKey(String siteKey);
}

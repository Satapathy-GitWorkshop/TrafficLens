package com.trafficlens.analytics.repository;

import com.trafficlens.analytics.model.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SiteRepository extends JpaRepository<Site, UUID> {
    List<Site> findByUserId(UUID userId);
    Optional<Site> findBySiteKey(String siteKey);
    boolean existsBySiteKeyAndUserId(String siteKey, UUID userId);
}

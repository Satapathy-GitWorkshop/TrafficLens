package com.trafficlens.analytics.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.trafficlens.analytics.model.Event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsRepository extends JpaRepository<Event, UUID> {

    @Query(value = """
        SELECT COUNT(*) FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        AND event_type = 'pageview'
        """, nativeQuery = true)
    long countPageViews(@Param("siteKey") String siteKey,
                        @Param("from") LocalDateTime from,
                        @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT COUNT(DISTINCT visitor_id) FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        """, nativeQuery = true)
    long countUniqueVisitors(@Param("siteKey") String siteKey,
                              @Param("from") LocalDateTime from,
                              @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT COUNT(DISTINCT session_id) FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        """, nativeQuery = true)
    long countSessions(@Param("siteKey") String siteKey,
                       @Param("from") LocalDateTime from,
                       @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT COUNT(DISTINCT visitor_id) FROM events
        WHERE site_key = :siteKey AND created_at >= :since
        """, nativeQuery = true)
    long countActiveVisitors(@Param("siteKey") String siteKey,
                              @Param("since") LocalDateTime since);

    @Query(value = """
        SELECT
            DATE_TRUNC(:granularity, created_at) as date,
            COUNT(*) FILTER (WHERE event_type = 'pageview') as page_views,
            COUNT(DISTINCT visitor_id) as visitors,
            COUNT(DISTINCT session_id) as sessions
        FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        GROUP BY DATE_TRUNC(:granularity, created_at)
        ORDER BY date
        """, nativeQuery = true)
    List<Object[]> getTimeSeries(@Param("siteKey") String siteKey,
                                  @Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to,
                                  @Param("granularity") String granularity);

    @Query(value = """
        SELECT url, COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_visitors
        FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        AND event_type = 'pageview' AND url IS NOT NULL
        GROUP BY url
        ORDER BY views DESC
        LIMIT 20
        """, nativeQuery = true)
    List<Object[]> getTopPages(@Param("siteKey") String siteKey,
                                @Param("from") LocalDateTime from,
                                @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT
            COALESCE(NULLIF(referrer, ''), 'Direct') as referrer,
            COUNT(*) as visits
        FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        AND event_type = 'pageview'
        GROUP BY referrer
        ORDER BY visits DESC
        LIMIT 20
        """, nativeQuery = true)
    List<Object[]> getReferrers(@Param("siteKey") String siteKey,
                                 @Param("from") LocalDateTime from,
                                 @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT device_type, COUNT(*) as cnt
        FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        AND device_type IS NOT NULL
        GROUP BY device_type
        ORDER BY cnt DESC
        """, nativeQuery = true)
    List<Object[]> getDeviceBreakdown(@Param("siteKey") String siteKey,
                                       @Param("from") LocalDateTime from,
                                       @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT browser, COUNT(*) as cnt
        FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        AND browser IS NOT NULL
        GROUP BY browser
        ORDER BY cnt DESC
        LIMIT 10
        """, nativeQuery = true)
    List<Object[]> getBrowserBreakdown(@Param("siteKey") String siteKey,
                                        @Param("from") LocalDateTime from,
                                        @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT country, COUNT(DISTINCT visitor_id) as visitors
        FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        AND country IS NOT NULL
        GROUP BY country
        ORDER BY visitors DESC
        LIMIT 20
        """, nativeQuery = true)
    List<Object[]> getCountryBreakdown(@Param("siteKey") String siteKey,
                                        @Param("from") LocalDateTime from,
                                        @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT url, country, device_type, created_at
        FROM events
        WHERE site_key = :siteKey AND created_at >= :since
        AND event_type = 'pageview'
        ORDER BY created_at DESC
        LIMIT 20
        """, nativeQuery = true)
    List<Object[]> getRecentEvents(@Param("siteKey") String siteKey,
                                    @Param("since") LocalDateTime since);

    @Query(value = """
        SELECT url, COUNT(*) as cnt
        FROM events
        WHERE site_key = :siteKey AND created_at >= :since
        AND event_type = 'pageview'
        GROUP BY url
        ORDER BY cnt DESC
        LIMIT 10
        """, nativeQuery = true)
    List<Object[]> getActivePages(@Param("siteKey") String siteKey,
                                   @Param("since") LocalDateTime since);

    @Query(value = """
        SELECT utm_source, utm_medium, utm_campaign, COUNT(DISTINCT session_id) as sessions
        FROM events
        WHERE site_key = :siteKey AND created_at BETWEEN :from AND :to
        AND utm_source IS NOT NULL
        GROUP BY utm_source, utm_medium, utm_campaign
        ORDER BY sessions DESC
        LIMIT 20
        """, nativeQuery = true)
    List<Object[]> getUtmStats(@Param("siteKey") String siteKey,
                                @Param("from") LocalDateTime from,
                                @Param("to") LocalDateTime to);
}

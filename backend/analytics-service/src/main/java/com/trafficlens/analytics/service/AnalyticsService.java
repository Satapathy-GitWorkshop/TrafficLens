package com.trafficlens.analytics.service;

import com.trafficlens.analytics.dto.AnalyticsDtos.*;
import com.trafficlens.analytics.model.Site;
import com.trafficlens.analytics.repository.AnalyticsRepository;
import com.trafficlens.analytics.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepo;
    private final SiteRepository siteRepo;

    public SiteStats getFullStats(String siteKey, LocalDateTime from, LocalDateTime to, String granularity) {
        return SiteStats.builder()
                .overview(getOverview(siteKey, from, to))
                .timeSeries(getTimeSeries(siteKey, from, to, granularity))
                .topPages(getTopPages(siteKey, from, to))
                .referrers(getReferrers(siteKey, from, to))
                .devices(getDeviceBreakdown(siteKey, from, to))
                .browsers(getBrowserBreakdown(siteKey, from, to))
                .countries(getCountryBreakdown(siteKey, from, to))
                .utmSources(getUtmStats(siteKey, from, to))
                .build();
    }

    public OverviewStats getOverview(String siteKey, LocalDateTime from, LocalDateTime to) {
        long pageViews = analyticsRepo.countPageViews(siteKey, from, to);
        long visitors = analyticsRepo.countUniqueVisitors(siteKey, from, to);
        long sessions = analyticsRepo.countSessions(siteKey, from, to);
        long activeNow = analyticsRepo.countActiveVisitors(siteKey, LocalDateTime.now().minusMinutes(5));

        // Calculate previous period for comparison
        long duration = to.toLocalDate().toEpochDay() - from.toLocalDate().toEpochDay();
        LocalDateTime prevFrom = from.minusDays(duration + 1);
        LocalDateTime prevTo = from.minusDays(1);

        long prevViews = analyticsRepo.countPageViews(siteKey, prevFrom, prevTo);
        long prevVisitors = analyticsRepo.countUniqueVisitors(siteKey, prevFrom, prevTo);
        long prevSessions = analyticsRepo.countSessions(siteKey, prevFrom, prevTo);

        return OverviewStats.builder()
                .totalPageViews(pageViews)
                .uniqueVisitors(visitors)
                .totalSessions(sessions)
                .activeNow(activeNow)
                .bounceRate(calculateBounceRate(sessions))
                .avgSessionDuration(45.0) // Placeholder - compute from sessions table
                .pageViewsChange(calcChange(pageViews, prevViews))
                .visitorsChange(calcChange(visitors, prevVisitors))
                .sessionsChange(calcChange(sessions, prevSessions))
                .bounceRateChange(0.0)
                .build();
    }

    public List<TimeSeriesPoint> getTimeSeries(String siteKey, LocalDateTime from, LocalDateTime to, String granularity) {
        String gran = granularity != null ? granularity : "day";
        List<Object[]> rows = analyticsRepo.getTimeSeries(siteKey, from, to, gran);
        return rows.stream().map(row -> TimeSeriesPoint.builder()
                .date(row[0] != null ? row[0].toString() : "")
                .pageViews(toLong(row[1]))
                .visitors(toLong(row[2]))
                .sessions(toLong(row[3]))
                .bounceRate(0.0)
                .build()).collect(Collectors.toList());
    }

    public List<TopPage> getTopPages(String siteKey, LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = analyticsRepo.getTopPages(siteKey, from, to);
        return rows.stream().map(row -> TopPage.builder()
                .url(row[0] != null ? row[0].toString() : "")
                .views(toLong(row[1]))
                .uniqueVisitors(toLong(row[2]))
                .avgDuration(0.0)
                .bounceRate(0.0)
                .build()).collect(Collectors.toList());
    }

    public List<ReferrerStat> getReferrers(String siteKey, LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = analyticsRepo.getReferrers(siteKey, from, to);
        long total = rows.stream().mapToLong(r -> toLong(r[1])).sum();
        return rows.stream().map(row -> {
            long visits = toLong(row[1]);
            return ReferrerStat.builder()
                    .referrer(row[0] != null ? row[0].toString() : "Direct")
                    .visits(visits)
                    .percentage(total > 0 ? (visits * 100.0 / total) : 0)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<DeviceStat> getDeviceBreakdown(String siteKey, LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = analyticsRepo.getDeviceBreakdown(siteKey, from, to);
        long total = rows.stream().mapToLong(r -> toLong(r[1])).sum();
        return rows.stream().map(row -> {
            long count = toLong(row[1]);
            return DeviceStat.builder()
                    .type(row[0] != null ? row[0].toString() : "unknown")
                    .count(count)
                    .percentage(total > 0 ? (count * 100.0 / total) : 0)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<BrowserStat> getBrowserBreakdown(String siteKey, LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = analyticsRepo.getBrowserBreakdown(siteKey, from, to);
        long total = rows.stream().mapToLong(r -> toLong(r[1])).sum();
        return rows.stream().map(row -> {
            long count = toLong(row[1]);
            return BrowserStat.builder()
                    .browser(row[0] != null ? row[0].toString() : "unknown")
                    .count(count)
                    .percentage(total > 0 ? (count * 100.0 / total) : 0)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<CountryStat> getCountryBreakdown(String siteKey, LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = analyticsRepo.getCountryBreakdown(siteKey, from, to);
        long total = rows.stream().mapToLong(r -> toLong(r[1])).sum();
        return rows.stream().map(row -> {
            long visitors = toLong(row[1]);
            return CountryStat.builder()
                    .country(row[0] != null ? row[0].toString() : "Unknown")
                    .countryCode("")
                    .visitors(visitors)
                    .percentage(total > 0 ? (visitors * 100.0 / total) : 0)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<UtmStat> getUtmStats(String siteKey, LocalDateTime from, LocalDateTime to) {
        List<Object[]> rows = analyticsRepo.getUtmStats(siteKey, from, to);
        return rows.stream().map(row -> UtmStat.builder()
                .source(row[0] != null ? row[0].toString() : "")
                .medium(row[1] != null ? row[1].toString() : "")
                .campaign(row[2] != null ? row[2].toString() : "")
                .sessions(toLong(row[3]))
                .conversions(0)
                .build()).collect(Collectors.toList());
    }

    public RealTimeStats getRealTime(String siteKey) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(30);
        long activeNow = analyticsRepo.countActiveVisitors(siteKey, LocalDateTime.now().minusMinutes(5));

        List<Object[]> pageRows = analyticsRepo.getActivePages(siteKey, since);
        List<String> activePages = pageRows.stream()
                .map(r -> r[0] != null ? r[0].toString() : "")
                .collect(Collectors.toList());

        List<Object[]> eventRows = analyticsRepo.getRecentEvents(siteKey, since);
        List<RecentEvent> recentEvents = eventRows.stream().map(row -> RecentEvent.builder()
                .url(row[0] != null ? row[0].toString() : "")
                .country(row[1] != null ? row[1].toString() : "Unknown")
                .device(row[2] != null ? row[2].toString() : "unknown")
                .timestamp(row[3] != null ? row[3].toString() : "")
                .build()).collect(Collectors.toList());

        return RealTimeStats.builder()
                .activeNow(activeNow)
                .activePages(activePages)
                .recentEvents(recentEvents)
                .build();
    }

    public ComparisonStats getComparison(String siteKey, LocalDateTime from, LocalDateTime to,
                                          LocalDateTime prevFrom, LocalDateTime prevTo, String granularity) {
        return ComparisonStats.builder()
                .current(getTimeSeries(siteKey, from, to, granularity))
                .previous(getTimeSeries(siteKey, prevFrom, prevTo, granularity))
                .currentSummary(getOverview(siteKey, from, to))
                .previousSummary(getOverview(siteKey, prevFrom, prevTo))
                .build();
    }

    // Site management
    public Site createSite(String name, String domain, UUID userId) {
        String siteKey = generateSiteKey(domain);
        Site site = Site.builder()
                .name(name)
                .domain(domain)
                .siteKey(siteKey)
                .userId(userId)
                .build();
        return siteRepo.save(site);
    }

    public List<Site> getSites(UUID userId) {
        return siteRepo.findByUserId(userId);
    }

    public void deleteSite(UUID siteId, UUID userId) {
        siteRepo.findById(siteId).ifPresent(site -> {
            if (site.getUserId().equals(userId)) {
                siteRepo.delete(site);
            }
        });
    }

    private String generateSiteKey(String domain) {
        String base = domain.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        return base + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    private double calculateBounceRate(long sessions) {
        return sessions > 0 ? 45.0 : 0.0; // Simplified — compute from sessions table in production
    }

    private double calcChange(long current, long previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return ((current - previous) * 100.0) / previous;
    }

    private long toLong(Object obj) {
        if (obj == null) return 0;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try { return Long.parseLong(obj.toString()); } catch (Exception e) { return 0; }
    }
}

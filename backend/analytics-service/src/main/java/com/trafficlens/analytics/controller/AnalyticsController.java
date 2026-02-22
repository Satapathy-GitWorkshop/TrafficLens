package com.trafficlens.analytics.controller;

import com.trafficlens.analytics.dto.AnalyticsDtos.*;
import com.trafficlens.analytics.model.Site;
import com.trafficlens.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // ─── SITE MANAGEMENT ──────────────────────────────────────────────────────

    @PostMapping("/sites")
    public ResponseEntity<Site> createSite(
            @RequestBody Map<String, String> body,
            @RequestHeader("X-User-Id") String userId) {
        Site site = analyticsService.createSite(
                body.get("name"), body.get("domain"), UUID.fromString(userId));
        return ResponseEntity.ok(site);
    }

    @GetMapping("/sites")
    public ResponseEntity<List<Site>> getSites(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(analyticsService.getSites(UUID.fromString(userId)));
    }

    @DeleteMapping("/sites/{siteId}")
    public ResponseEntity<Void> deleteSite(
            @PathVariable String siteId,
            @RequestHeader("X-User-Id") String userId) {
        analyticsService.deleteSite(UUID.fromString(siteId), UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }

    // ─── ANALYTICS ENDPOINTS ──────────────────────────────────────────────────

    @GetMapping("/{siteKey}/overview")
    public ResponseEntity<OverviewStats> getOverview(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days) {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        return ResponseEntity.ok(analyticsService.getOverview(siteKey, from, to));
    }

    @GetMapping("/{siteKey}/stats")
    public ResponseEntity<SiteStats> getFullStats(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "day") String granularity) {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        return ResponseEntity.ok(analyticsService.getFullStats(siteKey, from, to, granularity));
    }

    @GetMapping("/{siteKey}/timeseries")
    public ResponseEntity<List<TimeSeriesPoint>> getTimeSeries(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "day") String granularity) {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        return ResponseEntity.ok(analyticsService.getTimeSeries(siteKey, from, to, granularity));
    }

    @GetMapping("/{siteKey}/pages")
    public ResponseEntity<List<TopPage>> getTopPages(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days) {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        return ResponseEntity.ok(analyticsService.getTopPages(siteKey, from, to));
    }

    @GetMapping("/{siteKey}/referrers")
    public ResponseEntity<List<ReferrerStat>> getReferrers(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days) {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        return ResponseEntity.ok(analyticsService.getReferrers(siteKey, from, to));
    }

    @GetMapping("/{siteKey}/devices")
    public ResponseEntity<List<DeviceStat>> getDevices(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days) {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        return ResponseEntity.ok(analyticsService.getDeviceBreakdown(siteKey, from, to));
    }

    @GetMapping("/{siteKey}/browsers")
    public ResponseEntity<List<BrowserStat>> getBrowsers(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days) {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        return ResponseEntity.ok(analyticsService.getBrowserBreakdown(siteKey, from, to));
    }

    @GetMapping("/{siteKey}/countries")
    public ResponseEntity<List<CountryStat>> getCountries(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days) {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        return ResponseEntity.ok(analyticsService.getCountryBreakdown(siteKey, from, to));
    }

    @GetMapping("/{siteKey}/utm")
    public ResponseEntity<List<UtmStat>> getUtm(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days) {
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        return ResponseEntity.ok(analyticsService.getUtmStats(siteKey, from, to));
    }

    @GetMapping("/{siteKey}/realtime")
    public ResponseEntity<RealTimeStats> getRealTime(@PathVariable String siteKey) {
        return ResponseEntity.ok(analyticsService.getRealTime(siteKey));
    }

    @GetMapping("/{siteKey}/compare")
    public ResponseEntity<ComparisonStats> compare(
            @PathVariable String siteKey,
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "previous_period") String compareTo,
            @RequestParam(defaultValue = "day") String granularity) {

        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(days);
        LocalDateTime prevTo = from.minusDays(1);
        LocalDateTime prevFrom = prevTo.minusDays(days);

        if ("previous_year".equals(compareTo)) {
            prevFrom = from.minusYears(1);
            prevTo = to.minusYears(1);
        }

        return ResponseEntity.ok(analyticsService.getComparison(siteKey, from, to, prevFrom, prevTo, granularity));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "analytics-service"));
    }
}

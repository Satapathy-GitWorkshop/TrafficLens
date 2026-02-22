package com.trafficlens.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

public class AnalyticsDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewStats {
        private long totalPageViews;
        private long uniqueVisitors;
        private long totalSessions;
        private double bounceRate;
        private double avgSessionDuration;
        private long activeNow;
        // Comparison with previous period
        private double pageViewsChange;
        private double visitorsChange;
        private double sessionsChange;
        private double bounceRateChange;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private String date;
        private long pageViews;
        private long visitors;
        private long sessions;
        private double bounceRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPage {
        private String url;
        private long views;
        private long uniqueVisitors;
        private double avgDuration;
        private double bounceRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReferrerStat {
        private String referrer;
        private long visits;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceStat {
        private String type;
        private long count;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrowserStat {
        private String browser;
        private long count;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountryStat {
        private String country;
        private String countryCode;
        private long visitors;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtmStat {
        private String source;
        private String medium;
        private String campaign;
        private long sessions;
        private long conversions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RealTimeStats {
        private long activeNow;
        private List<String> activePages;
        private List<RecentEvent> recentEvents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentEvent {
        private String url;
        private String country;
        private String device;
        private String timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonStats {
        private List<TimeSeriesPoint> current;
        private List<TimeSeriesPoint> previous;
        private OverviewStats currentSummary;
        private OverviewStats previousSummary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SiteStats {
        private OverviewStats overview;
        private List<TimeSeriesPoint> timeSeries;
        private List<TopPage> topPages;
        private List<ReferrerStat> referrers;
        private List<DeviceStat> devices;
        private List<BrowserStat> browsers;
        private List<CountryStat> countries;
        private List<UtmStat> utmSources;
    }

    @Data
    public static class AnalyticsQuery {
        private String siteKey;
        private String dateFrom;
        private String dateTo;
        private String compareTo; // previous_period, previous_year
        private String granularity; // hour, day, week, month
    }
}

package com.trafficlens.report.service;

import com.opencsv.CSVWriter;
import com.trafficlens.report.model.Report;
import com.trafficlens.report.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepo;
    private final WebClient.Builder webClientBuilder;

    @Value("${analytics.service.url}")
    private String analyticsServiceUrl;

    @Value("${reports.directory:/tmp/trafficlens-reports}")
    private String reportsDirectory;

    public Report createReport(UUID userId, String siteKey, String name,
                                String reportType, LocalDate from, LocalDate to) {
        Report report = Report.builder()
                .userId(userId)
                .siteKey(siteKey)
                .name(name)
                .reportType(reportType)
                .dateFrom(from)
                .dateTo(to)
                .status("PENDING")
                .build();

        report = reportRepo.save(report);
        final UUID reportId = report.getId();

        // Async generation
        Thread.ofVirtual().start(() -> generateReport(reportId, siteKey, reportType, from, to));

        return report;
    }

    private void generateReport(UUID reportId, String siteKey, String reportType,
                                  LocalDate from, LocalDate to) {
        try {
            Report report = reportRepo.findById(reportId).orElseThrow();
            report.setStatus("PROCESSING");
            reportRepo.save(report);

            int days = (int) (to.toEpochDay() - from.toEpochDay());
            String url = analyticsServiceUrl + "/api/analytics/" + siteKey + "/stats?days=" + days;

            Map<?, ?> stats = webClientBuilder.build()
                    .get().uri(url)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String filePath = generateCsv(reportId, reportType, stats);

            report.setFilePath(filePath);
            report.setStatus("READY");
            reportRepo.save(report);

        } catch (Exception e) {
            log.error("Failed to generate report {}: {}", reportId, e.getMessage());
            reportRepo.findById(reportId).ifPresent(r -> {
                r.setStatus("FAILED");
                reportRepo.save(r);
            });
        }
    }

    private String generateCsv(UUID reportId, String type, Map<?, ?> stats) throws IOException {
        Path dir = Paths.get(reportsDirectory);
        Files.createDirectories(dir);
        String filename = "report_" + reportId + ".csv";
        Path filePath = dir.resolve(filename);

        try (CSVWriter writer = new CSVWriter(new FileWriter(filePath.toFile()))) {
            writer.writeNext(new String[]{"TrafficLens Report", "Generated: " + new Date()});
            writer.writeNext(new String[]{});

            if (stats != null) {
                Object overview = stats.get("overview");
                if (overview instanceof Map) {
                    writer.writeNext(new String[]{"OVERVIEW"});
                    writer.writeNext(new String[]{"Metric", "Value"});
                    ((Map<?, ?>) overview).forEach((k, v) ->
                            writer.writeNext(new String[]{k.toString(), v != null ? v.toString() : "0"}));
                    writer.writeNext(new String[]{});
                }

                Object topPages = stats.get("topPages");
                if (topPages instanceof List) {
                    writer.writeNext(new String[]{"TOP PAGES"});
                    writer.writeNext(new String[]{"URL", "Views", "Unique Visitors"});
                    ((List<?>) topPages).forEach(page -> {
                        if (page instanceof Map) {
                            Map<?, ?> p = (Map<?, ?>) page;
                            writer.writeNext(new String[]{
                                    p.getOrDefault("url", "").toString(),
                                    p.getOrDefault("views", "0").toString(),
                                    p.getOrDefault("uniqueVisitors", "0").toString()
                            });
                        }
                    });
                }
            }
        }
        return filePath.toString();
    }

    public List<Report> getUserReports(UUID userId) {
        return reportRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<byte[]> downloadReport(UUID reportId, UUID userId) throws IOException {
        Optional<Report> reportOpt = reportRepo.findById(reportId);
        if (reportOpt.isEmpty() || !reportOpt.get().getUserId().equals(userId)) {
            return Optional.empty();
        }

        Report report = reportOpt.get();
        if (!"READY".equals(report.getStatus()) || report.getFilePath() == null) {
            return Optional.empty();
        }

        return Optional.of(Files.readAllBytes(Paths.get(report.getFilePath())));
    }

    public void deleteReport(UUID reportId, UUID userId) {
        reportRepo.findById(reportId).ifPresent(report -> {
            if (report.getUserId().equals(userId)) {
                if (report.getFilePath() != null) {
                    try { Files.deleteIfExists(Paths.get(report.getFilePath())); } catch (IOException ignored) {}
                }
                reportRepo.delete(report);
            }
        });
    }
}

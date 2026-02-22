package com.trafficlens.report.controller;

import com.trafficlens.report.model.Report;
import com.trafficlens.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Report> createReport(
            @RequestBody Map<String, String> body,
            @RequestHeader("X-User-Id") String userId) {

        Report report = reportService.createReport(
                UUID.fromString(userId),
                body.get("siteKey"),
                body.get("name"),
                body.getOrDefault("reportType", "full"),
                LocalDate.parse(body.get("dateFrom")),
                LocalDate.parse(body.get("dateTo"))
        );
        return ResponseEntity.ok(report);
    }

    @GetMapping
    public ResponseEntity<List<Report>> getReports(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(reportService.getUserReports(UUID.fromString(userId)));
    }

    @GetMapping("/{reportId}/download")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable String reportId,
            @RequestHeader("X-User-Id") String userId) throws IOException {

        Optional<byte[]> data = reportService.downloadReport(
                UUID.fromString(reportId), UUID.fromString(userId));

        if (data.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data.get());
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable String reportId,
            @RequestHeader("X-User-Id") String userId) {
        reportService.deleteReport(UUID.fromString(reportId), UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "report-service"));
    }
}

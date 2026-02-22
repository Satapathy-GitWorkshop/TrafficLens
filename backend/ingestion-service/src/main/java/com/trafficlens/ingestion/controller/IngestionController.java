package com.trafficlens.ingestion.controller;

import com.trafficlens.ingestion.dto.EventRequest;
import com.trafficlens.ingestion.service.IngestionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ingest")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IngestionController {

    private final IngestionService ingestionService;

    @PostMapping("/event")
    public ResponseEntity<Map<String, String>> ingestEvent(
            @RequestBody EventRequest request,
            HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        ingestionService.processEvent(request, ip, userAgent);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // For GET-based tracking (pixel tracking, some edge cases)
    @GetMapping("/collect")
    public ResponseEntity<byte[]> collectPixel(
            @RequestParam String siteKey,
            @RequestParam(required = false) String url,
            @RequestParam(required = false) String ref,
            @RequestParam(required = false) String sid,
            @RequestParam(required = false) String vid,
            HttpServletRequest httpRequest) {

        EventRequest request = new EventRequest();
        request.setSiteKey(siteKey);
        request.setUrl(url);
        request.setReferrer(ref);
        request.setSessionId(sid);
        request.setVisitorId(vid);
        request.setEventType("pageview");

        String ip = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        ingestionService.processEvent(request, ip, userAgent);

        // Return transparent 1x1 pixel
        byte[] pixel = new byte[]{
            0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
            0x01, 0x00, (byte)0x80, 0x00, 0x00, 0x00, 0x00, 0x00,
            (byte)0xFF, (byte)0xFF, (byte)0xFF, 0x21, (byte)0xF9, 0x04,
            0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00,
            0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
            0x01, 0x44, 0x00, 0x3B
        };

        return ResponseEntity.ok()
                .header("Content-Type", "image/gif")
                .header("Cache-Control", "no-store, no-cache")
                .body(pixel);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "ingestion-service"));
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

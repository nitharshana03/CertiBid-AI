package com.certibid.risk.service.impl;

import com.certibid.risk.dto.response.ExternalBidDetailDto;
import com.certibid.risk.service.GeminiAiService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAiServiceImpl implements GeminiAiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key:${GEMINI_API_KEY:}}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String modelName;

    @Override
    public Map<String, Object> analyzeBidRisk(ExternalBidDetailDto bid) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("GEMINI_API_KEY is not configured. Using deterministic fallback. No random scores are generated.");
            return generateDeterministicFallback(bid, "Gemini API key is not configured.");
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + modelName + ":generateContent?key=" + apiKey.trim();

            String promptText = buildPrompt(bid);

            Map<String, Object> textPart = Map.of("text", promptText);
            Map<String, Object> contentsObj = Map.of(
                    "role", "user",
                    "parts", List.of(textPart)
            );
            Map<String, Object> generationConfig = Map.of(
                    "temperature", 0.1,
                    "responseMimeType", "application/json"
            );
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(contentsObj),
                    "generationConfig", generationConfig
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String modelJson = extractGeminiText(response.getBody());
                Map<String, Object> parsed = parseAndValidate(modelJson);
                parsed.put("aiProvider", "Google Gemini");
                parsed.put("aiModel", modelName);
                parsed.put("aiGenerated", true);
                log.info("Gemini {} returned a valid structured risk assessment for bid {}.", modelName, bid.getBidId());
                return parsed;
            }

            log.warn("Gemini API returned HTTP {} for bid {}.", response.getStatusCode().value(), bid.getBidId());
        } catch (Exception e) {
            log.error("Gemini API request failed for bid {}: {}", bid.getBidId(), e.getMessage(), e);
        }

        return generateDeterministicFallback(bid, "Gemini API request failed; deterministic fallback used.");
    }

    private String buildPrompt(ExternalBidDetailDto bid) {
        return """
                You are a public procurement risk-analysis assistant. Analyze ONE submitted bid using only the supplied facts.
                Do not invent vendor history, financial statements, legal records, competitor bids, or external facts.
                This is a screening aid, not a final finding of misconduct.

                Bid data:
                - Bid ID: %s
                - Tender ID: %s
                - Tender title: %s
                - Estimated budget: %s
                - Proposed amount: %s
                - Completion time (days): %s
                - Bid status: %s
                - Vendor name: %s
                - Vendor rating: %s
                - Verification status: %s
                - Proposal summary: %s

                Analyze:
                1. Price anomaly relative to the estimated budget.
                2. Possible collusion/bid-rigging indicators visible in the supplied bid data. Do not claim collusion as a fact.
                3. Financial risk based only on available information.
                4. Compliance risk based only on the verification/status information supplied.

                Return ONLY a valid JSON object with exactly these fields:
                {
                  "overallRiskScore": integer 0-100,
                  "riskLevel": "Low" | "Medium" | "High" | "Critical",
                  "confidenceScore": number 0-100,
                  "priceAnomalyScore": integer 0-100,
                  "collusionProbability": number 0-100,
                  "financialRiskScore": integer 0-100,
                  "complianceScore": integer 0-100,
                  "keyFactors": ["short factual factor", "..."],
                  "recommendations": ["practical next step", "..."],
                  "analysisSummary": "short explanation of the assessment"
                }
                Keep keyFactors and recommendations concise (2-5 items each).
                """.formatted(
                safe(bid.getBidId()), safe(bid.getTenderId()), safe(bid.getTenderTitle()),
                number(bid.getEstimatedBudget()), number(bid.getProposedAmount()),
                number(bid.getCompletionTimeDays()), safe(bid.getStatus()), safe(bid.getVendorName()),
                number(bid.getVendorRating()), safe(bid.getVerificationStatus()), safe(bid.getProposalSummary())
        );
    }

    private String extractGeminiText(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        if (textNode.isMissingNode() || textNode.asText().isBlank()) {
            throw new IllegalStateException("Gemini response did not contain candidate text.");
        }
        return cleanJson(textNode.asText());
    }

    private Map<String, Object> parseAndValidate(String json) throws Exception {
        Map<String, Object> result = objectMapper.readValue(json, new TypeReference<>() {});

        int overall = intValue(result.get("overallRiskScore"), -1);
        int price = intValue(result.get("priceAnomalyScore"), -1);
        int financial = intValue(result.get("financialRiskScore"), -1);
        int compliance = intValue(result.get("complianceScore"), -1);
        double confidence = doubleValue(result.get("confidenceScore"), -1);
        double collusion = doubleValue(result.get("collusionProbability"), -1);
        String level = String.valueOf(result.getOrDefault("riskLevel", ""));

        if (!inRange(overall, 0, 100) || !inRange(price, 0, 100) || !inRange(financial, 0, 100)
                || !inRange(compliance, 0, 100) || !inRange(confidence, 0, 100)
                || !inRange(collusion, 0, 100)
                || !(level.equals("Low") || level.equals("Medium") || level.equals("High") || level.equals("Critical"))) {
            throw new IllegalArgumentException("Gemini returned invalid risk fields.");
        }

        result.put("overallRiskScore", overall);
        result.put("priceAnomalyScore", price);
        result.put("financialRiskScore", financial);
        result.put("complianceScore", compliance);
        result.put("confidenceScore", confidence);
        result.put("collusionProbability", collusion);
        result.put("riskLevel", level);
        result.put("keyFactors", stringList(result.get("keyFactors")));
        result.put("recommendations", stringList(result.get("recommendations")));
        result.put("analysisSummary", String.valueOf(result.getOrDefault("analysisSummary", "Gemini risk assessment completed.")));
        return result;
    }

    private Map<String, Object> generateDeterministicFallback(ExternalBidDetailDto bid, String reason) {
        Map<String, Object> result = new LinkedHashMap<>();
        double proposed = bid.getProposedAmount() != null ? bid.getProposedAmount() : 0.0;
        double budget = bid.getEstimatedBudget() != null && bid.getEstimatedBudget() > 0 ? bid.getEstimatedBudget() : 0.0;
        double variance = budget > 0 ? Math.abs(proposed - budget) / budget * 100.0 : 0.0;
        int priceAnomaly = (int) Math.min(100, Math.round(variance * 2.5));
        int compliance = "VERIFIED".equalsIgnoreCase(String.valueOf(bid.getVerificationStatus())) ? 95 : 45;
        int financial = bid.getVendorRating() != null ? Math.max(0, Math.min(100, 100 - (int) Math.round(bid.getVendorRating() * 20))) : 50;
        int overall = Math.min(100, Math.round((priceAnomaly * 0.45f) + ((100 - compliance) * 0.25f) + (financial * 0.30f)));
        String level = overall < 25 ? "Low" : overall < 50 ? "Medium" : overall < 75 ? "High" : "Critical";

        result.put("overallRiskScore", overall);
        result.put("riskLevel", level);
        result.put("confidenceScore", 60.0);
        result.put("priceAnomalyScore", priceAnomaly);
        result.put("collusionProbability", 0.0);
        result.put("financialRiskScore", financial);
        result.put("complianceScore", compliance);
        result.put("keyFactors", List.of(
                String.format("Bid amount differs from the estimated budget by %.1f%%.", variance),
                "Vendor verification status: " + safe(bid.getVerificationStatus()) + ".",
                reason
        ));
        result.put("recommendations", List.of(
                "Configure GEMINI_API_KEY and rerun the analysis for an AI assessment.",
                "Review supporting procurement documents before award."
        ));
        result.put("analysisSummary", "Deterministic fallback assessment; Gemini was not available for this analysis.");
        result.put("aiProvider", "Fallback rules");
        result.put("aiModel", "none");
        result.put("aiGenerated", false);
        return result;
    }

    private static String cleanJson(String text) {
        String cleaned = text.trim();
        if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
            int firstNewline = cleaned.indexOf('\n');
            cleaned = firstNewline >= 0 ? cleaned.substring(firstNewline + 1, cleaned.length() - 3).trim() : cleaned.substring(3, cleaned.length() - 3).trim();
        }
        return cleaned;
    }

    private static List<String> stringList(Object value) {
        if (value instanceof List<?> list) return list.stream().map(String::valueOf).limit(5).toList();
        return List.of(String.valueOf(value == null ? "Not provided." : value));
    }

    private static int intValue(Object value, int fallback) {
        if (value instanceof Number n) return n.intValue();
        try { return Integer.parseInt(String.valueOf(value)); } catch (Exception e) { return fallback; }
    }

    private static double doubleValue(Object value, double fallback) {
        if (value instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(String.valueOf(value)); } catch (Exception e) { return fallback; }
    }

    private static boolean inRange(double value, double min, double max) { return value >= min && value <= max; }
    private static String safe(Object value) { return value == null ? "Not provided" : String.valueOf(value); }
    private static String number(Object value) { return value == null ? "Not provided" : String.valueOf(value); }
}

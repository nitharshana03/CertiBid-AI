package com.certibid.risk.service.impl;

import com.certibid.risk.client.ProcurementServiceClient;
import com.certibid.risk.dto.RiskAnalysisResponse;
import com.certibid.risk.dto.RiskEvaluationRequest;
import com.certibid.risk.dto.request.EscalateCaseRequest;
import com.certibid.risk.dto.response.ExternalBidDetailDto;
import com.certibid.risk.entity.EscalationLog;
import com.certibid.risk.entity.RiskAnalysis;
import com.certibid.risk.exception.RiskAnalysisNotFoundException;
import com.certibid.risk.repository.EscalationLogRepository;
import com.certibid.risk.repository.RiskAnalysisRepository;
import com.certibid.risk.service.GeminiAiService;
import com.certibid.risk.service.RiskAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskAnalysisServiceImpl implements RiskAnalysisService {

    private final RiskAnalysisRepository riskRepository;
    private final EscalationLogRepository escalationRepository;
    private final ProcurementServiceClient procurementClient;
    private final GeminiAiService geminiAiService;
    private final ObjectMapper objectMapper;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Override
    public RiskAnalysisResponse evaluateRisk(RiskEvaluationRequest request) {
        String bidId = request.getBidId();

        // 1. Fetch live details from Procurement Microservice via REST
        ExternalBidDetailDto externalBid = procurementClient.getBidDetails(bidId);

        // 2. Perform Gemini AI / Heuristic Analysis
        Map<String, Object> aiResult = geminiAiService.analyzeBidRisk(externalBid);

        // 3. Load or create RiskAnalysis entity
        RiskAnalysis analysis = riskRepository.findByBidId(bidId)
                .orElse(RiskAnalysis.builder().bidId(bidId).build());

        analysis.setTenderId(externalBid.getTenderId() != null ? externalBid.getTenderId() : request.getTenderId());
        analysis.setVendorId(externalBid.getVendorId() != null ? externalBid.getVendorId() : request.getVendorId());

        analysis.setOverallRiskScore((Integer) aiResult.getOrDefault("overallRiskScore", 18));
        analysis.setRiskLevel((String) aiResult.getOrDefault("riskLevel", "Low"));
        analysis.setConfidenceScore((Double) aiResult.getOrDefault("confidenceScore", 96.0));
        analysis.setPriceAnomalyScore((Integer) aiResult.getOrDefault("priceAnomalyScore", 12));

        Object collProb = aiResult.get("collusionProbability");
        analysis.setCollusionProbability(collProb instanceof Number ? ((Number) collProb).doubleValue() : 0.0);

        analysis.setFinancialRiskScore((Integer) aiResult.getOrDefault("financialRiskScore", 15));
        analysis.setComplianceScore((Integer) aiResult.getOrDefault("complianceScore", 95));

        List<String> keyFactors = (List<String>) aiResult.getOrDefault("keyFactors", Arrays.asList("Standard proposal variance.", "Verified credentials."));
        List<String> recommendations = (List<String>) aiResult.getOrDefault("recommendations", Arrays.asList("Proceed to technical evaluation."));

        analysis.setKeyFactors(toJson(keyFactors));
        analysis.setRecommendations(toJson(recommendations));
        analysis.setAnalysisSummary((String) aiResult.getOrDefault("analysisSummary", "AI Risk analysis completed."));
        analysis.setAiProvider((String) aiResult.getOrDefault("aiProvider", "Google Gemini"));
        analysis.setAiModel((String) aiResult.getOrDefault("aiModel", geminiModel));
        analysis.setAiGenerated(Boolean.TRUE.equals(aiResult.get("aiGenerated")));
        analysis.setStatus("COMPLETED");

        RiskAnalysis saved = riskRepository.save(analysis);
        return mapToResponse(saved, externalBid.getTenderTitle(), externalBid.getVendorName());
    }

    @Override
    public RiskAnalysisResponse getRiskAnalysisByBidId(String bidId) {
        Optional<RiskAnalysis> opt = riskRepository.findByBidId(bidId);
        if (opt.isPresent() && Boolean.TRUE.equals(opt.get().getAiGenerated())) {
            ExternalBidDetailDto details = procurementClient.getBidDetails(bidId);
            return mapToResponse(opt.get(), details.getTenderTitle(), details.getVendorName());
        }

        // Re-analyze legacy/random records so the dashboard is backed by the current AI pipeline.
        RiskEvaluationRequest req = RiskEvaluationRequest.builder()
                .bidId(bidId)
                .build();
        return evaluateRisk(req);
    }

    @Override
    public List<RiskAnalysisResponse> getRiskAnalysisByTenderId(String tenderId) {
        List<RiskAnalysis> list = riskRepository.findByTenderId(tenderId);
        List<RiskAnalysisResponse> responses = new ArrayList<>();
        for (RiskAnalysis ra : list) {
            responses.add(mapToResponse(ra, null, null));
        }
        return responses;
    }

    @Override
    public List<RiskAnalysisResponse> getAllAnalyses() {
        List<RiskAnalysis> list = riskRepository.findAll();
        List<RiskAnalysisResponse> responses = new ArrayList<>();
        for (RiskAnalysis ra : list) {
            responses.add(mapToResponse(ra, null, null));
        }
        return responses;
    }

    @Override
    public RiskAnalysisResponse escalateRiskCase(String bidId, EscalateCaseRequest request) {
        RiskAnalysis analysis = riskRepository.findByBidId(bidId)
                .orElseThrow(() -> new RiskAnalysisNotFoundException("Risk analysis not found for bidId: " + bidId));

        analysis.setIsEscalated(true);
        analysis.setEscalatedBy(request.getEscalatedBy());
        analysis.setEscalatedTo(request.getEscalatedTo());
        analysis.setEscalationNotes(request.getReason());
        riskRepository.save(analysis);

        EscalationLog logEntry = EscalationLog.builder()
                .bidId(bidId)
                .escalatedBy(request.getEscalatedBy())
                .escalatedTo(request.getEscalatedTo())
                .reason(request.getReason())
                .urgency(request.getUrgency() != null ? request.getUrgency() : "HIGH")
                .status("OPEN")
                .build();
        escalationRepository.save(logEntry);

        ExternalBidDetailDto details = procurementClient.getBidDetails(bidId);
        return mapToResponse(analysis, details.getTenderTitle(), details.getVendorName());
    }

    private RiskAnalysisResponse mapToResponse(RiskAnalysis entity, String fallbackTitle, String fallbackVendor) {
        Map<String, RiskAnalysisResponse.RiskIndicator> indicators = new LinkedHashMap<>();

        int priceScore = entity.getPriceAnomalyScore() != null ? entity.getPriceAnomalyScore() : 0;
        indicators.put("priceAnomaly", RiskAnalysisResponse.RiskIndicator.builder()
                .score(priceScore)
                .status(priceScore < 30 ? "Normal" : priceScore < 60 ? "Warning" : "High")
                .details("Gemini assessment of bid price versus the supplied tender budget.")
                .build());

        double collProb = entity.getCollusionProbability() != null ? entity.getCollusionProbability() : 0.0;
        indicators.put("collusionDetection", RiskAnalysisResponse.RiskIndicator.builder()
                .score((int) Math.round(collProb))
                .status(collProb < 10.0 ? "Clear" : collProb < 40.0 ? "Review" : "Flagged")
                .details("AI screening for possible bid-rigging indicators; this is not a finding of misconduct.")
                .build());

        int finRisk = entity.getFinancialRiskScore() != null ? entity.getFinancialRiskScore() : 0;
        indicators.put("financialRisk", RiskAnalysisResponse.RiskIndicator.builder()
                .score(finRisk)
                .status(finRisk < 30 ? "Low" : finRisk < 60 ? "Moderate" : "High")
                .details("AI assessment based only on financial information supplied with the bid.")
                .build());

        int compScore = entity.getComplianceScore() != null ? entity.getComplianceScore() : 0;
        int complianceRisk = 100 - compScore;
        indicators.put("complianceRisk", RiskAnalysisResponse.RiskIndicator.builder()
                .score(complianceRisk)
                .status(compScore >= 80 ? "Verified" : compScore >= 50 ? "Review" : "Flagged")
                .details("AI assessment of supplied verification and compliance status.")
                .build());

        List<String> keyFactors = parseList(entity.getKeyFactors(), List.of("No AI factors were stored."));
        List<String> recommendations = parseList(entity.getRecommendations(), List.of("Review the bid documents manually."));

        RiskAnalysisResponse.ExplainableAI explainable = RiskAnalysisResponse.ExplainableAI.builder()
                .keyFactors(keyFactors)
                .recommendations(recommendations)
                .build();

        List<RiskAnalysisResponse.TimelineItem> timeline = Collections.singletonList(
                RiskAnalysisResponse.TimelineItem.builder()
                        .step("Gemini 2.5 Flash AI Risk Analysis")
                        .result(entity.getStatus() != null ? entity.getStatus() : "Completed")
                        .date(entity.getUpdatedAt() != null
                                ? entity.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                                : LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                        .build()
        );

        return RiskAnalysisResponse.builder()
                .bidId(entity.getBidId())
                .tenderId(entity.getTenderId())
                .tenderTitle(fallbackTitle != null ? fallbackTitle : "Procurement Tender - " + entity.getTenderId())
                .vendorName(fallbackVendor != null ? fallbackVendor : "Vendor Enterprise - " + entity.getVendorId())
                .overallRiskScore(entity.getOverallRiskScore())
                .riskLevel(entity.getRiskLevel())
                .confidenceScore(entity.getConfidenceScore())
                .riskIndicators(indicators)
                .explainableAI(explainable)
                .timeline(timeline)
                .status(entity.getStatus())
                .aiProvider(entity.getAiProvider())
                .aiModel(entity.getAiModel())
                .aiGenerated(Boolean.TRUE.equals(entity.getAiGenerated()))
                .analysisSummary(entity.getAnalysisSummary())
                .build();
    }

    private String toJson(Object value) {
        try { return objectMapper.writeValueAsString(value); } catch (Exception e) { return "[]"; }
    }

    private List<String> parseList(String value, List<String> fallback) {
        if (value == null || value.isBlank()) return fallback;
        try {
            return objectMapper.readValue(value, new TypeReference<List<String>>() {});
        } catch (Exception ignored) {
            String normalized = value.replace("[", "").replace("]", "");
            if (normalized.isBlank()) return fallback;
            return Arrays.stream(normalized.split(","))
                    .map(String::trim)
                    .map(s -> s.replaceAll("^\\\"|\\\"$", ""))
                    .filter(s -> !s.isBlank())
                    .toList();
        }
    }

}

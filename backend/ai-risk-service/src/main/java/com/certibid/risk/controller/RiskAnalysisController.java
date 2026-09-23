package com.certibid.risk.controller;

import com.certibid.risk.dto.RiskAnalysisResponse;
import com.certibid.risk.dto.RiskEvaluationRequest;
import com.certibid.risk.dto.request.EscalateCaseRequest;
import com.certibid.risk.service.RiskAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/risk-analysis")
@RequiredArgsConstructor
public class RiskAnalysisController {

    private final RiskAnalysisService riskService;

    @PostMapping("/evaluate")
    public ResponseEntity<RiskAnalysisResponse> evaluateRisk(@Valid @RequestBody RiskEvaluationRequest request) {
        RiskAnalysisResponse response = riskService.evaluateRisk(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{bidId}")
    public ResponseEntity<RiskAnalysisResponse> getRiskAnalysis(@PathVariable String bidId) {
        RiskAnalysisResponse response = riskService.getRiskAnalysisByBidId(bidId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tender/{tenderId}")
    public ResponseEntity<List<RiskAnalysisResponse>> getTenderRiskAnalyses(@PathVariable String tenderId) {
        List<RiskAnalysisResponse> responses = riskService.getRiskAnalysisByTenderId(tenderId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping
    public ResponseEntity<List<RiskAnalysisResponse>> getAllAnalyses() {
        List<RiskAnalysisResponse> responses = riskService.getAllAnalyses();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{bidId}/escalate")
    public ResponseEntity<RiskAnalysisResponse> escalateCase(
            @PathVariable String bidId,
            @Valid @RequestBody EscalateCaseRequest request) {
        RiskAnalysisResponse response = riskService.escalateRiskCase(bidId, request);
        return ResponseEntity.ok(response);
    }
}

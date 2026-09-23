package com.certibid.risk.service;

import com.certibid.risk.dto.RiskAnalysisResponse;
import com.certibid.risk.dto.RiskEvaluationRequest;
import com.certibid.risk.dto.request.EscalateCaseRequest;

import java.util.List;

public interface RiskAnalysisService {
    RiskAnalysisResponse evaluateRisk(RiskEvaluationRequest request);
    RiskAnalysisResponse getRiskAnalysisByBidId(String bidId);
    List<RiskAnalysisResponse> getRiskAnalysisByTenderId(String tenderId);
    List<RiskAnalysisResponse> getAllAnalyses();
    RiskAnalysisResponse escalateRiskCase(String bidId, EscalateCaseRequest request);
}

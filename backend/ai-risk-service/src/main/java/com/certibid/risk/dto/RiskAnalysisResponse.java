package com.certibid.risk.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAnalysisResponse {
    private String bidId;
    private String tenderId;
    private String tenderTitle;
    private String vendorName;
    private Integer overallRiskScore;
    private String riskLevel;
    private Double confidenceScore;

    private Map<String, RiskIndicator> riskIndicators;
    private ExplainableAI explainableAI;
    private List<TimelineItem> timeline;
    private String status;
    private String aiProvider;
    private String aiModel;
    private Boolean aiGenerated;
    private String analysisSummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskIndicator {
        private Integer score;
        private String status;
        private String details;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExplainableAI {
        private List<String> keyFactors;
        private List<String> recommendations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineItem {
        private String step;
        private String result;
        private String date;
    }
}

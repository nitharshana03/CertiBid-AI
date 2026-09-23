package com.certibid.procurement.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class RiskServiceClient {

    @Value("${ai-risk-service.url:http://localhost:8083}")
    private String riskServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void triggerRiskEvaluation(String bidId, String tenderId, String vendorId) {
        try {
            String url = riskServiceUrl + "/api/v1/risk-analysis/evaluate";
            Map<String, String> request = new HashMap<>();
            request.put("bidId", bidId);
            request.put("tenderId", tenderId);
            request.put("vendorId", vendorId);
            restTemplate.postForLocation(url, request);
        } catch (Exception e) {
            System.err.println("Failed to trigger background risk evaluation: " + e.getMessage());
        }
    }
}

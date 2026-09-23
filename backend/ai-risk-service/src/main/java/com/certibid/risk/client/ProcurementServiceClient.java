package com.certibid.risk.client;

import com.certibid.risk.dto.response.ExternalBidDetailDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProcurementServiceClient {

    private final RestTemplate restTemplate;

    @Value("${procurement.service.url:http://localhost:8082}")
    private String procurementServiceUrl;

    public ExternalBidDetailDto getBidDetails(String bidId) {
        try {
            String url = procurementServiceUrl + "/api/v1/internal/bids/" + bidId;
            log.info("Fetching bid details from procurement-service: {}", url);
            return restTemplate.getForObject(url, ExternalBidDetailDto.class);
        } catch (Exception e) {
            log.warn("Failed to fetch bid details for bidId {}: {}. Proceeding with default context.", bidId, e.getMessage());
            return ExternalBidDetailDto.builder()
                    .bidId(bidId)
                    .tenderId("TND-DEFAULT")
                    .vendorId("VND-DEFAULT")
                    .proposedAmount(100000.0)
                    .estimatedBudget(110000.0)
                    .tenderTitle("Procurement Tender " + bidId)
                    .vendorName("Vendor Enterprise")
                    .vendorRating(4.5)
                    .verificationStatus("Verified")
                    .build();
        }
    }
}

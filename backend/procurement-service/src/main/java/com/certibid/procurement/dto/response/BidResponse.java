package com.certibid.procurement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidResponse {

    private String id;
    private String tenderId;
    private String tenderTitle;
    private String vendorId;
    private String vendorName;
    private BigDecimal proposedAmount;
    private String currency;
    private String estimatedCompletionTime;
    private BigDecimal bidScore;
    private Integer aiRiskScore;
    private String riskLevel;
    private String documentStatus;
    private String eligibilityStatus;
    private String verificationStatus;
    private String status;
    private String emdPaymentStatus;
    private String emdTransactionId;
    private List<Map<String, String>> proposalFiles;
    private LocalDateTime submissionDate;
}

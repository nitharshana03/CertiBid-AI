package com.certibid.risk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskEvaluationRequest {
    @NotBlank(message = "bidId is required")
    private String bidId;

    private String tenderId;
    private String vendorId;
    private Double proposedAmount;
    private String tenderTitle;
    private String vendorName;
}

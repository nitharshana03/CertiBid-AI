package com.certibid.risk.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalBidDetailDto {
    private String bidId;
    private String tenderId;
    private String vendorId;
    private Double proposedAmount;
    private Integer completionTimeDays;
    private String status;
    private String proposalSummary;
    private String tenderTitle;
    private Double estimatedBudget;
    private String vendorName;
    private Double vendorRating;
    private String verificationStatus;
}

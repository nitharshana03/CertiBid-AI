package com.certibid.procurement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class SubmitBidRequest {

    @NotBlank(message = "Tender ID is required")
    private String tenderId;

    private String tenderTitle;

    @NotBlank(message = "Vendor ID is required")
    private String vendorId;

    private String vendorName;

    @NotNull(message = "Proposed amount is required")
    @Min(value = 1, message = "Proposed amount must be greater than zero")
    private BigDecimal proposedAmount;

    private String currency = "USD";

    @NotBlank(message = "Estimated completion time is required")
    private String estimatedCompletionTime;

    private List<Map<String, String>> proposalFiles;
}

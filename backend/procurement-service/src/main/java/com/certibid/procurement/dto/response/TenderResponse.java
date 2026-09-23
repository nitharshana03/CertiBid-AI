package com.certibid.procurement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenderResponse {

    private String id;
    private String title;
    private String department;
    private String category;
    private String location;
    private BigDecimal budget;
    private String currency;
    private LocalDate publishingDate;
    private LocalDate submissionDeadline;
    private LocalDate openingDate;
    private String status;
    private String riskLevel;
    private Integer aiRiskScore;
    private Integer eligibleVendorsCount;
    private Integer bidsCount;
    private String description;
    private List<String> requirements;
    private List<Map<String, String>> documents;
    private String createdBy;
    private LocalDateTime createdAt;
}

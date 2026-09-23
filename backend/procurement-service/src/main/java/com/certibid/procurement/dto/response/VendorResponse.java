package com.certibid.procurement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorResponse {

    private String id;
    private String companyName;
    private String registrationNumber;
    private String taxId;
    private String category;
    private BigDecimal rating;
    private Integer eligibilityScore;
    private Integer riskScore;
    private String riskLevel;
    private String verificationStatus;
    private String financialHealth;
    private Boolean blacklisted;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private Integer completedProjectsCount;
    private BigDecimal annualTurnover;
    private LocalDate joinedDate;
    private LocalDateTime createdAt;
}

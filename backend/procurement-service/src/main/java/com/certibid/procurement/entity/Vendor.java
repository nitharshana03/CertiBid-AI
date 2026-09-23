package com.certibid.procurement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;

    @Column(name = "registration_number", nullable = false, unique = true, length = 100)
    private String registrationNumber;

    @Column(name = "tax_id", nullable = false, unique = true, length = 100)
    private String taxId;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = new BigDecimal("4.50");

    @Column(name = "eligibility_score")
    @Builder.Default
    private Integer eligibilityScore = 80;

    @Column(name = "risk_score")
    @Builder.Default
    private Integer riskScore = 20;

    @Column(name = "risk_level", length = 20)
    @Builder.Default
    private String riskLevel = "Low";

    @Column(name = "verification_status", nullable = false, length = 30)
    @Builder.Default
    private String verificationStatus = "Verified";

    @Column(name = "financial_health", length = 10)
    @Builder.Default
    private String financialHealth = "A+";

    @Builder.Default
    private Boolean blacklisted = false;

    @Column(name = "contact_person", nullable = false, length = 150)
    private String contactPerson;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(nullable = false, length = 50)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "completed_projects_count")
    @Builder.Default
    private Integer completedProjectsCount = 0;

    @Column(name = "annual_turnover", precision = 15, scale = 2)
    private BigDecimal annualTurnover;

    @Column(name = "joined_date", nullable = false)
    private LocalDate joinedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (joinedDate == null) {
            joinedDate = LocalDate.now();
        }
    }
}

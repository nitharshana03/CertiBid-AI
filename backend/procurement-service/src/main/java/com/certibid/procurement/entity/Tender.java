package com.certibid.procurement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tender {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, length = 150)
    private String department;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal budget;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "publishing_date", nullable = false)
    private LocalDate publishingDate;

    @Column(name = "submission_deadline", nullable = false)
    private LocalDate submissionDeadline;

    @Column(name = "opening_date")
    private LocalDate openingDate;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "Active";

    @Column(name = "risk_level", length = 20)
    @Builder.Default
    private String riskLevel = "Low";

    @Column(name = "ai_risk_score")
    @Builder.Default
    private Integer aiRiskScore = 15;

    @Column(name = "eligible_vendors_count")
    @Builder.Default
    private Integer eligibleVendorsCount = 0;

    @Column(name = "bids_count")
    @Builder.Default
    private Integer bidsCount = 0;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements; // JSON or line-separated list

    @Column(name = "created_by", nullable = false, length = 36)
    private String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (publishingDate == null) {
            publishingDate = LocalDate.now();
        }
    }
}

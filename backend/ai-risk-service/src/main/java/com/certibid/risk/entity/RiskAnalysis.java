package com.certibid.risk.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "risk_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bidId;

    private String tenderId;
    private String vendorId;

    private Integer overallRiskScore;
    private String riskLevel;
    private Double confidenceScore;

    private Integer priceAnomalyScore;
    private Double collusionProbability;
    private Integer financialRiskScore;
    private Integer complianceScore;

    @Column(columnDefinition = "TEXT")
    private String keyFactors;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @Column(columnDefinition = "TEXT")
    private String flaggedItems;

    @Column(columnDefinition = "TEXT")
    private String analysisSummary;

    private String status;

    private String aiProvider;
    private String aiModel;
    private Boolean aiGenerated;

    /*
     * Risk escalation details
     */
    private Boolean isEscalated;
    private String escalatedBy;
    private String escalatedTo;

    @Column(columnDefinition = "TEXT")
    private String escalationNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = "COMPLETED";
        }

        if (isEscalated == null) {
            isEscalated = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
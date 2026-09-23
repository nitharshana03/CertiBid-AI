package com.certibid.procurement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bids")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bid {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tender_id", nullable = false)
    private Tender tender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "proposed_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal proposedAmount;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "estimated_completion_time", nullable = false, length = 50)
    private String estimatedCompletionTime;

    @Column(name = "bid_score", precision = 5, scale = 2)
    private BigDecimal bidScore;

    @Column(name = "ai_risk_score")
    @Builder.Default
    private Integer aiRiskScore = 20;

    @Column(name = "risk_level", length = 20)
    @Builder.Default
    private String riskLevel = "Low";

    @Column(name = "document_status", length = 30)
    @Builder.Default
    private String documentStatus = "Complete";

    @Column(name = "eligibility_status", length = 30)
    @Builder.Default
    private String eligibilityStatus = "Eligible";

    @Column(name = "verification_status", length = 30)
    @Builder.Default
    private String verificationStatus = "Verified";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "Submitted";

    @Column(name = "emd_payment_status", length = 30)
    @Builder.Default
    private String emdPaymentStatus = "Verified & Paid";

    @Column(name = "emd_transaction_id", length = 100)
    private String emdTransactionId;

    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate;

    @PrePersist
    protected void onCreate() {
        if (submissionDate == null) {
            submissionDate = LocalDateTime.now();
        }
    }
}

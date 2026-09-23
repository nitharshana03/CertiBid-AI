package com.certibid.procurement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tender_id")
    private Tender tender;

    @Column(name = "bid_id", length = 36)
    private String bidId;

    @Column(name = "document_type", nullable = false, length = 100)
    private String documentType;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "Under Review";

    @Column(name = "uploaded_at", nullable = false)
    private LocalDate uploadedAt;

    @Column(name = "ai_confidence")
    @Builder.Default
    private Integer aiConfidence = 90;

    @Column(name = "verified_by", length = 150)
    private String verifiedBy;

    @Column(name = "resubmission_reason", columnDefinition = "TEXT")
    private String resubmissionReason;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDate.now();
        }
    }
}

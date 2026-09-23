package com.certibid.procurement.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "tender_id", length = 36)
    private String tenderId;

    @Column(name = "tender_title", length = 300)
    private String tenderTitle;

    @Column(name = "bid_id", length = 36)
    private String bidId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "vendor_name", length = 200)
    private String vendorName;

    @Column(name = "transaction_type", nullable = false, length = 50)
    private String transactionType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "Completed";

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "invoice_no", length = 100)
    private String invoiceNo;

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    @PrePersist
    protected void onCreate() {
        if (date == null) {
            date = LocalDate.now();
        }
    }
}

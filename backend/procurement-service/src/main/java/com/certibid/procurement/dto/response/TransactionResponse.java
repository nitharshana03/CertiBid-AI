package com.certibid.procurement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private String id;
    private String tenderId;
    private String tenderTitle;
    private String bidId;
    private String vendorId;
    private String vendorName;
    private String transactionType;
    private BigDecimal amount;
    private String currency;
    private String status;
    private LocalDate date;
    private String invoiceNo;
    private String receiptUrl;
}

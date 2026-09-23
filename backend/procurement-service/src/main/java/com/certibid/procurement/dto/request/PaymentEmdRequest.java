package com.certibid.procurement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentEmdRequest {

    private String tenderId;
    private String tenderTitle;
    private String bidId;

    @NotBlank(message = "Vendor ID is required")
    private String vendorId;

    private String vendorName;

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be greater than zero")
    private BigDecimal amount;

    private String currency = "USD";
    private String paymentMethod;
}

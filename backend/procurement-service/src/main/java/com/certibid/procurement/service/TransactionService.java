package com.certibid.procurement.service;

import com.certibid.procurement.dto.request.PaymentEmdRequest;
import com.certibid.procurement.dto.response.TransactionResponse;

import java.util.List;
import java.util.Map;

public interface TransactionService {

    List<TransactionResponse> getTransactions(String vendorId);

    Map<String, Object> payEmd(PaymentEmdRequest request);
}

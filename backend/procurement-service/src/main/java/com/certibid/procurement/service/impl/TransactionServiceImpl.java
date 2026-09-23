package com.certibid.procurement.service.impl;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.certibid.procurement.dto.request.PaymentEmdRequest;
import com.certibid.procurement.dto.response.TransactionResponse;
import com.certibid.procurement.entity.Transaction;
import com.certibid.procurement.entity.Vendor;
import com.certibid.procurement.exception.ResourceNotFoundException;
import com.certibid.procurement.repository.TransactionRepository;
import com.certibid.procurement.repository.VendorRepository;
import com.certibid.procurement.service.TransactionService;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Override
    public List<TransactionResponse> getTransactions(String vendorId) {
        List<Transaction> transactions;

        if (vendorId != null && !vendorId.isEmpty()) {
            transactions = transactionRepository.findByVendorId(vendorId);
        } else {
            transactions = transactionRepository.findAll();
        }

        return transactions.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> payEmd(PaymentEmdRequest request) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseGet(() -> vendorRepository.findAll()
                        .stream()
                        .findFirst()
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Vendor record required")));

        String txnId = "TXN-EMD-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String invoiceNo = "INV-2026-"
                + (1000 + (int) (Math.random() * 9000));

        Transaction txn = Transaction.builder()
                .id(txnId)
                .tenderId(request.getTenderId())
                .tenderTitle(request.getTenderTitle() != null
                        ? request.getTenderTitle()
                        : "Public Infrastructure Project")
                .bidId(request.getBidId())
                .vendor(vendor)
                .vendorName(vendor.getCompanyName())
                .transactionType("EMD Deposit")
                .amount(request.getAmount())
                .currency(request.getCurrency() != null
                        ? request.getCurrency()
                        : "USD")
                .status("Completed")
                .date(LocalDate.now())
                .invoiceNo(invoiceNo)
                .receiptUrl("/receipts/" + txnId + ".pdf")
                .build();

        transactionRepository.save(txn);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "EMD Payment successfully processed");
        response.put("transactionId", txnId);
        response.put("invoiceNo", invoiceNo);
        response.put("status", "Completed");

        return response;
    }

    private TransactionResponse mapToResponse(Transaction txn) {
        return TransactionResponse.builder()
                .id(txn.getId())
                .tenderId(txn.getTenderId())
                .tenderTitle(txn.getTenderTitle())
                .bidId(txn.getBidId())
                .vendorId(txn.getVendor().getId())
                .vendorName(txn.getVendorName())
                .transactionType(txn.getTransactionType())
                .amount(txn.getAmount())
                .currency(txn.getCurrency())
                .status(txn.getStatus())
                .date(txn.getDate())
                .invoiceNo(txn.getInvoiceNo())
                .receiptUrl(txn.getReceiptUrl())
                .build();
    }
}
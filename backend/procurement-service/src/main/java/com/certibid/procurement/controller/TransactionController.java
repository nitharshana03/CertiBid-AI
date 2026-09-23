package com.certibid.procurement.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.certibid.procurement.dto.request.PaymentEmdRequest;
import com.certibid.procurement.dto.response.TransactionResponse;
import com.certibid.procurement.entity.Vendor;
import com.certibid.procurement.repository.VendorRepository;
import com.certibid.procurement.service.TransactionService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private VendorRepository vendorRepository;

    @GetMapping("/api/v1/transactions")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(
            @RequestParam(required = false) String vendorId,
            @RequestParam(required = false) String tenderId,
            HttpServletRequest request) {

        String rawRole = request.getHeader("X-User-Role");
        String role = rawRole != null ? rawRole.toUpperCase().trim() : "";

        if ("BIDDER".equals(role) || "VENDOR".equals(role)) {
            String authenticatedVendorId = getAuthenticatedVendorId(request);

            if (authenticatedVendorId == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            if (vendorId != null
                    && !vendorId.isEmpty()
                    && !vendorId.equals(authenticatedVendorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<TransactionResponse> responses =
                    transactionService.getTransactions(authenticatedVendorId);

            return ResponseEntity.ok(responses);
        }

        List<TransactionResponse> responses =
                transactionService.getTransactions(vendorId);

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/api/v1/emd/my-records")
    public ResponseEntity<List<TransactionResponse>> getMyEmdRecords(
            HttpServletRequest request) {

        String authenticatedVendorId = getAuthenticatedVendorId(request);

        if (authenticatedVendorId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<TransactionResponse> responses =
                transactionService.getTransactions(authenticatedVendorId);

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/api/v1/payments/emd")
    public ResponseEntity<Map<String, Object>> processEmdPayment(
            @Valid @RequestBody PaymentEmdRequest request) {

        Map<String, Object> response =
                transactionService.payEmd(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private String getAuthenticatedVendorId(HttpServletRequest request) {

        String vendorIdHeader = request.getHeader("X-Vendor-Id");

        if (vendorIdHeader != null && !vendorIdHeader.isEmpty()) {
            return vendorIdHeader;
        }

        String userEmail = request.getHeader("X-User-Email");

        if (userEmail != null && !userEmail.isEmpty()) {
            Optional<Vendor> vendorOpt =
                    vendorRepository.findByEmail(userEmail.toLowerCase().trim());

            if (vendorOpt.isPresent()) {
                return vendorOpt.get().getId();
            }
        }

        return null;
    }
}
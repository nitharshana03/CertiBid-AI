package com.certibid.procurement.controller;

import com.certibid.procurement.dto.request.SubmitBidRequest;
import com.certibid.procurement.dto.response.BidResponse;
import com.certibid.procurement.entity.Vendor;
import com.certibid.procurement.repository.VendorRepository;
import com.certibid.procurement.service.BidService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/bids")
public class BidController {

    @Autowired
    private BidService bidService;

    @Autowired
    private VendorRepository vendorRepository;

    @GetMapping
    public ResponseEntity<List<BidResponse>> getBids(
            @RequestParam(required = false) String tenderId,
            @RequestParam(required = false) String vendorId,
            HttpServletRequest request) {

        String rawRole = request.getHeader("X-User-Role");
        String role = rawRole != null ? rawRole.toUpperCase().trim() : "";

        if ("BIDDER".equals(role) || "VENDOR".equals(role)) {
            String authenticatedVendorId = getAuthenticatedVendorId(request);

            if (authenticatedVendorId == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            if (vendorId != null && !vendorId.isEmpty() && !vendorId.equals(authenticatedVendorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<BidResponse> bids = bidService.getBids(tenderId, authenticatedVendorId);
            return ResponseEntity.ok(bids);
        }

        List<BidResponse> bids = bidService.getBids(tenderId, vendorId);
        return ResponseEntity.ok(bids);
    }

    @GetMapping("/my-bids")
    public ResponseEntity<List<BidResponse>> getMyBids(HttpServletRequest request) {
        String authenticatedVendorId = getAuthenticatedVendorId(request);
        if (authenticatedVendorId == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<BidResponse> bids = bidService.getBids(null, authenticatedVendorId);
        return ResponseEntity.ok(bids);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BidResponse> getBidById(@PathVariable String id, HttpServletRequest request) {
        BidResponse bid = bidService.getBidById(id);

        String rawRole = request.getHeader("X-User-Role");
        String role = rawRole != null ? rawRole.toUpperCase().trim() : "";

        if ("BIDDER".equals(role) || "VENDOR".equals(role)) {
            String authenticatedVendorId = getAuthenticatedVendorId(request);
            if (authenticatedVendorId == null || !authenticatedVendorId.equals(bid.getVendorId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        return ResponseEntity.ok(bid);
    }

    @PostMapping
    public ResponseEntity<BidResponse> submitBid(@Valid @RequestBody SubmitBidRequest request) {
        BidResponse response = bidService.submitBid(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private String getAuthenticatedVendorId(HttpServletRequest request) {
        String vendorIdHeader = request.getHeader("X-Vendor-Id");
        if (vendorIdHeader != null && !vendorIdHeader.isEmpty()) {
            return vendorIdHeader;
        }

        String userEmail = request.getHeader("X-User-Email");
        if (userEmail != null && !userEmail.isEmpty()) {
            Optional<Vendor> vendorOpt = vendorRepository.findByEmail(userEmail.toLowerCase().trim());
            if (vendorOpt.isPresent()) {
                return vendorOpt.get().getId();
            }
        }

        return null;
    }
}

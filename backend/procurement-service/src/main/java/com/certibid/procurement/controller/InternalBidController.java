package com.certibid.procurement.controller;

import com.certibid.procurement.dto.response.BidResponse;
import com.certibid.procurement.entity.Bid;
import com.certibid.procurement.entity.Tender;
import com.certibid.procurement.entity.Vendor;
import com.certibid.procurement.exception.ResourceNotFoundException;
import com.certibid.procurement.repository.BidRepository;
import com.certibid.procurement.repository.TenderRepository;
import com.certibid.procurement.repository.VendorRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/internal/bids")
public class InternalBidController {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private TenderRepository tenderRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @GetMapping("/{bidId}")
    public ResponseEntity<InternalBidDetailDto> getInternalBidDetails(@PathVariable String bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new ResourceNotFoundException("Bid not found with id: " + bidId));

        Tender tender = bid.getTender();
        Vendor vendor = bid.getVendor();

        InternalBidDetailDto dto = InternalBidDetailDto.builder()
                .bidId(bid.getId())
                .tenderId(tender != null ? tender.getId() : "N/A")
                .vendorId(vendor != null ? vendor.getId() : "N/A")
                .proposedAmount(bid.getProposedAmount() != null ? bid.getProposedAmount().doubleValue() : 0.0)
                .completionTimeDays(bid.getEstimatedCompletionTime() != null ? parseDays(bid.getEstimatedCompletionTime()) : 180)
                .status(bid.getStatus())
                .proposalSummary("Submitted bid for tender " + (tender != null ? tender.getTitle() : ""))
                .tenderTitle(tender != null ? tender.getTitle() : "N/A")
                .estimatedBudget(tender != null && tender.getBudget() != null ? tender.getBudget().doubleValue() : 0.0)
                .vendorName(vendor != null ? vendor.getCompanyName() : "N/A")
                .vendorRating(vendor != null && vendor.getRating() != null ? vendor.getRating().doubleValue() : 0.0)
                .verificationStatus(vendor != null ? vendor.getVerificationStatus() : "Pending")
                .build();

        return ResponseEntity.ok(dto);
    }

    private static Integer parseDays(String text) {
        try {
            return Integer.parseInt(text.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return 180;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InternalBidDetailDto {
        private String bidId;
        private String tenderId;
        private String vendorId;
        private Double proposedAmount;
        private Integer completionTimeDays;
        private String status;
        private String proposalSummary;
        private String tenderTitle;
        private Double estimatedBudget;
        private String vendorName;
        private Double vendorRating;
        private String verificationStatus;
    }
}

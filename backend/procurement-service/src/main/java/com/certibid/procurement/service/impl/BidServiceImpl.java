package com.certibid.procurement.service.impl;

import com.certibid.procurement.client.RiskServiceClient;
import com.certibid.procurement.dto.request.SubmitBidRequest;
import com.certibid.procurement.dto.response.BidResponse;
import com.certibid.procurement.entity.Bid;
import com.certibid.procurement.entity.Tender;
import com.certibid.procurement.entity.Vendor;
import com.certibid.procurement.exception.ResourceNotFoundException;
import com.certibid.procurement.repository.BidRepository;
import com.certibid.procurement.repository.TenderRepository;
import com.certibid.procurement.repository.VendorRepository;
import com.certibid.procurement.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BidServiceImpl implements BidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private TenderRepository tenderRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private RiskServiceClient riskServiceClient;

    @Override
    public List<BidResponse> getBids(String tenderId, String vendorId) {
        List<Bid> bids;
        if (tenderId != null && !tenderId.isEmpty() && vendorId != null && !vendorId.isEmpty()) {
            bids = bidRepository.findByTenderIdAndVendorId(tenderId, vendorId);
        } else if (tenderId != null && !tenderId.isEmpty()) {
            bids = bidRepository.findByTenderId(tenderId);
        } else if (vendorId != null && !vendorId.isEmpty()) {
            bids = bidRepository.findByVendorId(vendorId);
        } else {
            bids = bidRepository.findAll();
        }

        return bids.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public BidResponse getBidById(String id) {
        Bid bid = bidRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bid not found with ID: " + id));
        return mapToResponse(bid);
    }

    @Override
    public BidResponse submitBid(SubmitBidRequest request) {
        Tender tender = tenderRepository.findById(request.getTenderId())
                .orElseThrow(() -> new ResourceNotFoundException("Tender not found with ID: " + request.getTenderId()));

        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseGet(() -> {
                    // Create auto vendor record if submitting bid from new bidder account
                    Vendor v = Vendor.builder()
                            .id(request.getVendorId())
                            .companyName(request.getVendorName() != null ? request.getVendorName() : "Bidder Enterprise")
                            .registrationNumber("REG-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                            .taxId("TAX-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                            .category(tender.getCategory())
                            .rating(new BigDecimal("4.80"))
                            .eligibilityScore(85)
                            .riskScore(18)
                            .riskLevel("Low")
                            .verificationStatus("Verified")
                            .contactPerson("Corporate Admin")
                            .email("admin@bidder.com")
                            .phone("+1 555-0199")
                            .build();
                    return vendorRepository.save(v);
                });

        String bidId = "BID-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Bid bid = Bid.builder()
                .id(bidId)
                .tender(tender)
                .vendor(vendor)
                .proposedAmount(request.getProposedAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .estimatedCompletionTime(request.getEstimatedCompletionTime())
                .bidScore(new BigDecimal("91.50"))
                .aiRiskScore(18)
                .riskLevel("Low")
                .documentStatus("Complete")
                .eligibilityStatus("Eligible")
                .verificationStatus("Verified")
                .status("Submitted")
                .emdPaymentStatus("Verified & Paid")
                .emdTransactionId("TXN-EMD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .submissionDate(LocalDateTime.now())
                .build();

        bidRepository.save(bid);

        // Update Tender Bids Count
        tender.setBidsCount((tender.getBidsCount() != null ? tender.getBidsCount() : 0) + 1);
        tenderRepository.save(tender);

        // Trigger background AI Risk evaluation via REST call
        riskServiceClient.triggerRiskEvaluation(bidId, tender.getId(), vendor.getId());

        return mapToResponse(bid);
    }

    private BidResponse mapToResponse(Bid bid) {
        List<Map<String, String>> proposalFiles = List.of(
                Map.of("name", "Technical Proposal Specification", "size", "3.2 MB", "type", "PDF"),
                Map.of("name", "Financial Cost Breakdown", "size", "1.8 MB", "type", "XLSX")
        );

        return BidResponse.builder()
                .id(bid.getId())
                .tenderId(bid.getTender().getId())
                .tenderTitle(bid.getTender().getTitle())
                .vendorId(bid.getVendor().getId())
                .vendorName(bid.getVendor().getCompanyName())
                .proposedAmount(bid.getProposedAmount())
                .currency(bid.getCurrency())
                .estimatedCompletionTime(bid.getEstimatedCompletionTime())
                .bidScore(bid.getBidScore())
                .aiRiskScore(bid.getAiRiskScore())
                .riskLevel(bid.getRiskLevel())
                .documentStatus(bid.getDocumentStatus())
                .eligibilityStatus(bid.getEligibilityStatus())
                .verificationStatus(bid.getVerificationStatus())
                .status(bid.getStatus())
                .emdPaymentStatus(bid.getEmdPaymentStatus())
                .emdTransactionId(bid.getEmdTransactionId())
                .proposalFiles(proposalFiles)
                .submissionDate(bid.getSubmissionDate())
                .build();
    }
}

package com.certibid.procurement.service.impl;

import com.certibid.procurement.dto.request.AwardContractRequest;
import com.certibid.procurement.dto.request.CreateTenderRequest;
import com.certibid.procurement.dto.response.TenderResponse;
import com.certibid.procurement.entity.AuditLog;
import com.certibid.procurement.entity.Bid;
import com.certibid.procurement.entity.Notification;
import com.certibid.procurement.entity.Tender;
import com.certibid.procurement.exception.ResourceNotFoundException;
import com.certibid.procurement.repository.AuditLogRepository;
import com.certibid.procurement.repository.BidRepository;
import com.certibid.procurement.repository.NotificationRepository;
import com.certibid.procurement.repository.TenderRepository;
import com.certibid.procurement.service.TenderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TenderServiceImpl implements TenderService {

    @Autowired
    private TenderRepository tenderRepository;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public List<TenderResponse> getTenders(String search, String status, String riskLevel) {
        List<Tender> tenders = tenderRepository.findAll();

        if (status != null && !status.isEmpty()) {
            tenders = tenders.stream()
                    .filter(t -> status.equalsIgnoreCase(t.getStatus()))
                    .collect(Collectors.toList());
        }

        if (riskLevel != null && !riskLevel.isEmpty()) {
            tenders = tenders.stream()
                    .filter(t -> riskLevel.equalsIgnoreCase(t.getRiskLevel()))
                    .collect(Collectors.toList());
        }

        if (search != null && !search.isEmpty()) {
            String lowerSearch = search.toLowerCase();
            tenders = tenders.stream()
                    .filter(t -> t.getTitle().toLowerCase().contains(lowerSearch) ||
                            t.getDepartment().toLowerCase().contains(lowerSearch) ||
                            t.getCategory().toLowerCase().contains(lowerSearch))
                    .collect(Collectors.toList());
        }

        return tenders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public TenderResponse getTenderById(String id) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tender not found with ID: " + id));
        return mapToResponse(tender);
    }

    @Override
    public TenderResponse createTender(CreateTenderRequest request, String userId) {
        String tenderId = "TND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        String requirementsStr = request.getRequirements() != null ? String.join("\n", request.getRequirements()) : "";

        Tender tender = Tender.builder()
                .id(tenderId)
                .title(request.getTitle())
                .department(request.getDepartment())
                .category(request.getCategory())
                .location(request.getLocation())
                .budget(request.getBudget())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .publishingDate(LocalDate.now())
                .submissionDeadline(request.getSubmissionDeadline())
                .openingDate(request.getOpeningDate() != null ? request.getOpeningDate() : request.getSubmissionDeadline().plusDays(1))
                .status("Active")
                .riskLevel("Low")
                .aiRiskScore(15)
                .eligibleVendorsCount(12)
                .bidsCount(0)
                .description(request.getDescription())
                .requirements(requirementsStr)
                .createdBy(userId != null ? userId : "OFFICER-001")
                .createdAt(LocalDateTime.now())
                .build();

        tenderRepository.save(tender);

        // Record Audit Log
        AuditLog auditLog = AuditLog.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId != null ? userId : "OFFICER-001")
                .userName("Procurement Officer")
                .userRole("OFFICER")
                .action("CREATED")
                .resourceType("TENDER")
                .resourceId(tenderId)
                .details("Created new tender: " + request.getTitle())
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(auditLog);

        return mapToResponse(tender);
    }

    @Override
    public TenderResponse updateTender(String id, Map<String, Object> updates) {
        Tender tender = tenderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tender not found with ID: " + id));

        if (updates.containsKey("status")) {
            tender.setStatus((String) updates.get("status"));
        }
        if (updates.containsKey("title")) {
            tender.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("description")) {
            tender.setDescription((String) updates.get("description"));
        }

        tenderRepository.save(tender);
        return mapToResponse(tender);
    }

    @Override
    public Map<String, Object> awardContract(String tenderId, AwardContractRequest request) {
        Tender tender = tenderRepository.findById(tenderId)
                .orElseThrow(() -> new ResourceNotFoundException("Tender not found with ID: " + tenderId));

        Bid bid = bidRepository.findById(request.getBidId())
                .orElseThrow(() -> new ResourceNotFoundException("Bid not found with ID: " + request.getBidId()));

        tender.setStatus("Awarded");
        tenderRepository.save(tender);

        bid.setStatus("Awarded");
        bidRepository.save(bid);

        // Send Notification to winning vendor
        Notification notif = Notification.builder()
                .id(UUID.randomUUID().toString())
                .userId(bid.getVendor().getId())
                .title("Contract Awarded!")
                .message("Congratulations! Your proposal for tender " + tender.getTitle() + " has been awarded.")
                .type("Award")
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();
        notificationRepository.save(notif);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Contract successfully awarded");
        response.put("tenderId", tenderId);
        response.put("bidId", request.getBidId());
        response.put("vendorName", bid.getVendor().getCompanyName());
        return response;
    }

    private TenderResponse mapToResponse(Tender tender) {
        List<String> reqs = Boolean.TRUE.equals(tender.getRequirements() != null && !tender.getRequirements().isEmpty())
                ? Arrays.asList(tender.getRequirements().split("\n"))
                : Collections.emptyList();

        List<Map<String, String>> docs = List.of(
                Map.of("name", "Notice Inviting Tender (NIT)", "size", "2.4 MB", "type", "PDF"),
                Map.of("name", "Technical Specifications & Scope", "size", "5.1 MB", "type", "PDF")
        );

        return TenderResponse.builder()
                .id(tender.getId())
                .title(tender.getTitle())
                .department(tender.getDepartment())
                .category(tender.getCategory())
                .location(tender.getLocation())
                .budget(tender.getBudget())
                .currency(tender.getCurrency())
                .publishingDate(tender.getPublishingDate())
                .submissionDeadline(tender.getSubmissionDeadline())
                .openingDate(tender.getOpeningDate())
                .status(tender.getStatus())
                .riskLevel(tender.getRiskLevel())
                .aiRiskScore(tender.getAiRiskScore())
                .eligibleVendorsCount(tender.getEligibleVendorsCount())
                .bidsCount(tender.getBidsCount())
                .description(tender.getDescription())
                .requirements(reqs)
                .documents(docs)
                .createdBy(tender.getCreatedBy())
                .createdAt(tender.getCreatedAt())
                .build();
    }
}

package com.certibid.procurement.controller;

import com.certibid.procurement.dto.request.AwardContractRequest;
import com.certibid.procurement.dto.request.CreateTenderRequest;
import com.certibid.procurement.dto.response.TenderResponse;
import com.certibid.procurement.service.TenderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tenders")
public class TenderController {

    @Autowired
    private TenderService tenderService;

    @GetMapping
    public ResponseEntity<List<TenderResponse>> getTenders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String riskLevel) {
        List<TenderResponse> tenders = tenderService.getTenders(search, status, riskLevel);
        return ResponseEntity.ok(tenders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TenderResponse> getTenderById(@PathVariable String id) {
        TenderResponse tender = tenderService.getTenderById(id);
        return ResponseEntity.ok(tender);
    }

    @PostMapping
    public ResponseEntity<TenderResponse> createTender(
            @Valid @RequestBody CreateTenderRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        TenderResponse response = tenderService.createTender(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TenderResponse> updateTender(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        TenderResponse response = tenderService.updateTender(id, updates);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/award")
    public ResponseEntity<Map<String, Object>> awardContract(
            @PathVariable String id,
            @Valid @RequestBody AwardContractRequest request) {
        Map<String, Object> response = tenderService.awardContract(id, request);
        return ResponseEntity.ok(response);
    }
}

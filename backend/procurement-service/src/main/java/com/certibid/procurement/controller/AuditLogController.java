package com.certibid.procurement.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.certibid.procurement.dto.response.AuditLogResponse;
import com.certibid.procurement.entity.AuditLog;
import com.certibid.procurement.repository.AuditLogRepository;

@RestController
@RequestMapping("/api/v1/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAuditLogs() {
        List<AuditLog> logs = auditLogRepository.findAll();

        List<AuditLogResponse> responseList = logs.stream()
                .map(log -> AuditLogResponse.builder()
                        .id(log.getId())
                        .userId(log.getUserId())
                        .userName(log.getUserName())
                        .userRole(log.getUserRole())
                        .action(log.getAction())
                        .resourceType(log.getResourceType())
                        .resourceId(log.getResourceId())
                        .details(log.getDetails())
                        .ipAddress(log.getIpAddress())
                        .timestamp(log.getTimestamp())
                        .build()
                )
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }
}
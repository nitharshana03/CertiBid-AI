package com.certibid.procurement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private String id;
    private String userId;
    private String userName;
    private String userRole;
    private String action;
    private String resourceType;
    private String resourceId;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}

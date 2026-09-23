package com.certibid.procurement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {

    private String id;
    private String title;
    private String vendorId;
    private String vendorName;
    private String tenderId;
    private String bidId;
    private String documentType;
    private String fileName;
    private String filePath;
    private Long fileSizeBytes;
    private String status;
    private LocalDate uploadedAt;
    private Integer aiConfidence;
    private String verifiedBy;
    private String resubmissionReason;
}

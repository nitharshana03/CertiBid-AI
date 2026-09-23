package com.certibid.procurement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateDocStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    private String resubmissionReason;
}

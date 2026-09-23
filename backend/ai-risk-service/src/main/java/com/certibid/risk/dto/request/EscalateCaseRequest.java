package com.certibid.risk.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalateCaseRequest {

    @NotBlank(message = "escalatedBy is required")
    private String escalatedBy;

    @NotBlank(message = "escalatedTo is required")
    private String escalatedTo;

    @NotBlank(message = "reason is required")
    private String reason;

    private String urgency;
}

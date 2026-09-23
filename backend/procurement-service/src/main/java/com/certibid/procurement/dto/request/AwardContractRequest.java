package com.certibid.procurement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AwardContractRequest {

    @NotBlank(message = "Bid ID is required")
    private String bidId;

    private String awardLetterNotes;
}

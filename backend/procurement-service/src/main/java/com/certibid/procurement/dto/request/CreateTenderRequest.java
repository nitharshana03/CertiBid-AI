package com.certibid.procurement.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateTenderRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Budget is required")
    @Min(value = 1, message = "Budget must be greater than zero")
    private BigDecimal budget;

    private String currency = "USD";

    @NotNull(message = "Submission deadline is required")
    private LocalDate submissionDeadline;

    private LocalDate openingDate;

    @NotBlank(message = "Description is required")
    private String description;

    private List<String> requirements;
}

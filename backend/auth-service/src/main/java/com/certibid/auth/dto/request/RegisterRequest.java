package com.certibid.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {

    private String companyName;
    private String taxId;
    private String category;
    
    @NotBlank(message = "Contact person name is required")
    private String contactPerson;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    private String role; // Defaults to VENDOR / BIDDER if not specified
}

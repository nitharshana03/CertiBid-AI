package com.certibid.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String role;
    private String roleTitle;
    private String department;
    private String organization;
    private String status;
    private String avatar;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}

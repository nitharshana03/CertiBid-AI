package com.certibid.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private String id;
    private String name;
    private String email;
    private String role;
    private String roleTitle;
    private String department;
    private String organization;
    private String bidderId;
    private String avatar;
}

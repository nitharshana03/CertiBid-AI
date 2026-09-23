package com.certibid.auth.service;

import com.certibid.auth.dto.request.*;
import com.certibid.auth.dto.response.AuthResponse;
import com.certibid.auth.dto.response.UserProfileResponse;

import java.util.Map;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    Map<String, Object> forgotPassword(ForgotPasswordRequest request);

    Map<String, Object> verifyOtp(VerifyOtpRequest request);

    Map<String, Object> resetPassword(ResetPasswordRequest request);

    UserProfileResponse getCurrentUser(String token);
}

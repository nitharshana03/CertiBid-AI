package com.certibid.auth.service.impl;

import com.certibid.auth.dto.request.*;
import com.certibid.auth.dto.response.AuthResponse;
import com.certibid.auth.dto.response.UserProfileResponse;
import com.certibid.auth.entity.PasswordResetToken;
import com.certibid.auth.entity.User;
import com.certibid.auth.exception.InvalidCredentialsException;
import com.certibid.auth.exception.UserAlreadyExistsException;
import com.certibid.auth.repository.PasswordResetTokenRepository;
import com.certibid.auth.repository.UserRepository;
import com.certibid.auth.security.JwtTokenProvider;
import com.certibid.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Override
    public AuthResponse login(LoginRequest request) {
        String reqEmail = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";
        User user = userRepository.findByEmail(reqEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Email not registered. Please register first."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid password. Please try again.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String normalizedRole = user.getRole() != null ? user.getRole().toUpperCase().trim() : "BIDDER";
        if ("VENDOR".equals(normalizedRole)) {
            normalizedRole = "BIDDER";
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), normalizedRole);

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(normalizedRole)
                .roleTitle(user.getRoleTitle())
                .department(user.getDepartment())
                .organization(user.getOrganization())
                .bidderId(user.getVendorId())
                .avatar(user.getAvatar())
                .build();

        return AuthResponse.builder()
                .token(token)
                .role(normalizedRole)
                .vendorId(user.getVendorId())
                .user(profile)
                .build();
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : "";

        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("Email is already registered");
        }

        // Protect Admin and Officer accounts
        if ("admin@certibid.com".equals(email) || "officer@certibid.com".equals(email) ||
            (request.getRole() != null && ("ADMIN".equalsIgnoreCase(request.getRole().trim()) || "OFFICER".equalsIgnoreCase(request.getRole().trim())))) {
            throw new UserAlreadyExistsException("Cannot register Admin or Officer accounts. Registration is for Bidders only.");
        }

        // All normal registration MUST create a BIDDER account
        String assignedRole = "BIDDER";

        String userId = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String vendorId = "VND-" + (10000 + (int)(Math.random() * 90000));

        User user = User.builder()
                .id(userId)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getContactPerson() != null && !request.getContactPerson().isBlank() ? request.getContactPerson() : (request.getCompanyName() != null ? request.getCompanyName() : "Bidder Representative"))
                .role(assignedRole)
                .roleTitle("Corporate Representative")
                .organization(request.getCompanyName() != null ? request.getCompanyName() : "Corporate Entity")
                .department(request.getCategory() != null ? request.getCategory() : "Bidding Operations")
                .vendorId(vendorId)
                .avatar(request.getContactPerson() != null && request.getContactPerson().length() >= 2 ? request.getContactPerson().substring(0, 2).toUpperCase() : "BD")
                .status("Active")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole());

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .roleTitle(user.getRoleTitle())
                .department(user.getDepartment())
                .organization(user.getOrganization())
                .bidderId(user.getVendorId())
                .avatar(user.getAvatar())
                .build();

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole())
                .vendorId(user.getVendorId())
                .user(profile)
                .build();
    }

    @Override
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("No user found with specified email address"));

        String otp = String.format("%06d", (int) (Math.random() * 1000000));
        PasswordResetToken token = PasswordResetToken.builder()
                .id(UUID.randomUUID().toString())
                .email(user.getEmail())
                .otpCode(otp)
                .isVerified(false)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .createdAt(LocalDateTime.now())
                .build();

        passwordResetTokenRepository.save(token);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Verification code sent to registered email address");
        response.put("otpSent", true);
        response.put("devOtpLog", otp); // Logged safely for dev testing
        return response;
    }

    @Override
    public Map<String, Object> verifyOtp(VerifyOtpRequest request) {
        PasswordResetToken token = passwordResetTokenRepository
                .findByEmailAndOtpCodeAndIsVerifiedFalse(request.getEmail().toLowerCase(), request.getOtp())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired OTP verification code"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidCredentialsException("OTP verification code has expired");
        }

        String resetToken = "RST-TOKEN-" + UUID.randomUUID().toString();
        token.setIsVerified(true);
        token.setResetToken(resetToken);
        passwordResetTokenRepository.save(token);

        Map<String, Object> response = new HashMap<>();
        response.put("resetToken", resetToken);
        response.put("verified", true);
        return response;
    }

    @Override
    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = passwordResetTokenRepository
                .findByResetTokenAndIsVerifiedTrue(request.getResetToken())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid password reset token"));

        User user = userRepository.findByEmail(token.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Associated user record not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete used token
        passwordResetTokenRepository.delete(token);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Password successfully reset");
        response.put("success", true);
        return response;
    }

    @Override
    public UserProfileResponse getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new InvalidCredentialsException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String userId = jwtTokenProvider.getUserIdFromToken(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("User profile not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .roleTitle(user.getRoleTitle())
                .department(user.getDepartment())
                .organization(user.getOrganization())
                .bidderId(user.getVendorId())
                .avatar(user.getAvatar())
                .build();
    }
}

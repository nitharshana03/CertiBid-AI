package com.certibid.auth.repository;

import com.certibid.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {

    Optional<PasswordResetToken> findByEmailAndOtpCodeAndIsVerifiedFalse(String email, String otpCode);

    Optional<PasswordResetToken> findByResetTokenAndIsVerifiedTrue(String resetToken);
}

package com.certibid.procurement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.certibid.procurement.entity.Vendor;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, String> {

    List<Vendor> findByVerificationStatus(String status);

    List<Vendor> findByRiskLevel(String riskLevel);

    Optional<Vendor> findByEmail(String email);
}
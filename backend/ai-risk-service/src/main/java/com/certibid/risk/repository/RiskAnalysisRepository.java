package com.certibid.risk.repository;

import com.certibid.risk.entity.RiskAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RiskAnalysisRepository extends JpaRepository<RiskAnalysis, Long> {
    Optional<RiskAnalysis> findByBidId(String bidId);
    List<RiskAnalysis> findByTenderId(String tenderId);
    List<RiskAnalysis> findByVendorId(String vendorId);
}

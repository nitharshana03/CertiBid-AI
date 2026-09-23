package com.certibid.procurement.repository;

import com.certibid.procurement.entity.Tender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TenderRepository extends JpaRepository<Tender, String> {

    List<Tender> findByStatus(String status);

    List<Tender> findByRiskLevel(String riskLevel);
}

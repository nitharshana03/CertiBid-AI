package com.certibid.risk.repository;

import com.certibid.risk.entity.EscalationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalationLogRepository extends JpaRepository<EscalationLog, String> {
    List<EscalationLog> findByBidId(String bidId);
}

package com.certibid.procurement.repository;

import com.certibid.procurement.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, String> {

    List<Bid> findByTenderId(String tenderId);

    List<Bid> findByVendorId(String vendorId);

    List<Bid> findByTenderIdAndVendorId(String tenderId, String vendorId);
}

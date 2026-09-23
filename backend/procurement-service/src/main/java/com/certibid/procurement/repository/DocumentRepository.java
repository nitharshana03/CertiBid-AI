package com.certibid.procurement.repository;

import com.certibid.procurement.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {

    List<Document> findByVendorId(String vendorId);

    List<Document> findByStatus(String status);
}

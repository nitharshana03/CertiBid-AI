package com.certibid.procurement.service;

import com.certibid.procurement.dto.request.UpdateDocStatusRequest;
import com.certibid.procurement.dto.response.DocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {

    List<DocumentResponse> getDocuments(String vendorId, String status);

    List<DocumentResponse> getDocumentsForBidder(String vendorId, String userEmail, String status);

    DocumentResponse getDocumentById(String id);

    boolean isOwnedByBidder(DocumentResponse doc, String vendorId, String userEmail);

    DocumentResponse uploadDocument(MultipartFile file, String title, String documentType, String vendorId, String tenderId, String bidId);

    DocumentResponse updateDocumentStatus(String id, UpdateDocStatusRequest request);

    void deleteDocument(String id);
}


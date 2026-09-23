package com.certibid.procurement.service.impl;

import com.certibid.procurement.dto.request.UpdateDocStatusRequest;
import com.certibid.procurement.dto.response.DocumentResponse;
import com.certibid.procurement.entity.Document;
import com.certibid.procurement.entity.Vendor;
import com.certibid.procurement.exception.ResourceNotFoundException;
import com.certibid.procurement.repository.DocumentRepository;
import com.certibid.procurement.repository.VendorRepository;
import com.certibid.procurement.service.DocumentService;
import com.certibid.procurement.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentServiceImpl implements DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public List<DocumentResponse> getDocuments(String vendorId, String status) {
        List<Document> documents = documentRepository.findAll();

        if (vendorId != null && !vendorId.isEmpty()) {
            documents = documents.stream()
                    .filter(d -> vendorId.equalsIgnoreCase(d.getVendor().getId()))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.isEmpty()) {
            documents = documents.stream()
                    .filter(d -> status.equalsIgnoreCase(d.getStatus()))
                    .collect(Collectors.toList());
        }

        return documents.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponse> getDocumentsForBidder(String vendorId, String userEmail, String status) {
        List<Document> documents = documentRepository.findAll();

        // Strict ownership filtering for bidder
        documents = documents.stream()
                .filter(d -> {
                    boolean matchVendorId = vendorId != null && !vendorId.isEmpty() && vendorId.equalsIgnoreCase(d.getVendor().getId());
                    boolean matchEmail = userEmail != null && !userEmail.isEmpty() && userEmail.equalsIgnoreCase(d.getVendor().getEmail());
                    return matchVendorId || matchEmail;
                })
                .collect(Collectors.toList());

        if (status != null && !status.isEmpty()) {
            documents = documents.stream()
                    .filter(d -> status.equalsIgnoreCase(d.getStatus()))
                    .collect(Collectors.toList());
        }

        return documents.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public DocumentResponse getDocumentById(String id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));
        return mapToResponse(doc);
    }

    @Override
    public boolean isOwnedByBidder(DocumentResponse doc, String vendorId, String userEmail) {
        if (doc == null) return false;
        boolean matchVendorId = vendorId != null && !vendorId.isEmpty() && vendorId.equalsIgnoreCase(doc.getVendorId());
        return matchVendorId;
    }

    @Override
    public void deleteDocument(String id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));
        documentRepository.delete(doc);
    }

    @Override
    public DocumentResponse uploadDocument(MultipartFile file, String title, String documentType, String vendorId, String tenderId, String bidId) {
        String filePath = fileStorageService.storeFile(file);

        Vendor vendor = vendorRepository.findById(vendorId != null ? vendorId : "VND-10001")
                .orElseGet(() -> vendorRepository.findAll().stream().findFirst().orElseThrow(() -> new ResourceNotFoundException("Vendor record required")));

        String docId = "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Document doc = Document.builder()
                .id(docId)
                .title(title != null ? title : file.getOriginalFilename())
                .vendor(vendor)
                .bidId(bidId)
                .documentType(documentType != null ? documentType : "Compliance Certificate")
                .fileName(file.getOriginalFilename())
                .filePath(filePath)
                .fileSizeBytes(file.getSize())
                .status("Under Review")
                .uploadedAt(LocalDate.now())
                .aiConfidence(92)
                .build();

        documentRepository.save(doc);

        return mapToResponse(doc);
    }

    @Override
    public DocumentResponse updateDocumentStatus(String id, UpdateDocStatusRequest request) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));

        doc.setStatus(request.getStatus());
        if (request.getResubmissionReason() != null) {
            doc.setResubmissionReason(request.getResubmissionReason());
        }

        documentRepository.save(doc);

        return mapToResponse(doc);
    }

    private DocumentResponse mapToResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .vendorId(doc.getVendor().getId())
                .vendorName(doc.getVendor().getCompanyName())
                .tenderId(doc.getTender() != null ? doc.getTender().getId() : null)
                .bidId(doc.getBidId())
                .documentType(doc.getDocumentType())
                .fileName(doc.getFileName())
                .filePath(doc.getFilePath())
                .fileSizeBytes(doc.getFileSizeBytes())
                .status(doc.getStatus())
                .uploadedAt(doc.getUploadedAt())
                .aiConfidence(doc.getAiConfidence())
                .verifiedBy(doc.getVerifiedBy())
                .resubmissionReason(doc.getResubmissionReason())
                .build();
    }
}

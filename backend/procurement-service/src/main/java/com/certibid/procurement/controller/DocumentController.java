package com.certibid.procurement.controller;

import com.certibid.procurement.dto.request.UpdateDocStatusRequest;
import com.certibid.procurement.dto.response.DocumentResponse;
import com.certibid.procurement.service.DocumentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getDocuments(
            @RequestParam(required = false) String vendorId,
            @RequestParam(required = false) String status,
            HttpServletRequest request) {

        String authRole = request.getHeader("X-User-Role");
        String userVendorId = request.getHeader("X-Vendor-Id");
        String userEmail = request.getHeader("X-User-Email");

        // Strict ownership enforcement for Bidders
        if ("BIDDER".equalsIgnoreCase(authRole) || "VENDOR".equalsIgnoreCase(authRole)) {
            List<DocumentResponse> documents = documentService.getDocumentsForBidder(userVendorId, userEmail, status);
            return ResponseEntity.ok(documents);
        }

        // Admin and Officer can view all documents or filter by vendorId
        List<DocumentResponse> documents = documentService.getDocuments(vendorId, status);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(
            @PathVariable String id,
            HttpServletRequest request) {

        String authRole = request.getHeader("X-User-Role");
        String userVendorId = request.getHeader("X-Vendor-Id");
        String userEmail = request.getHeader("X-User-Email");

        DocumentResponse doc = documentService.getDocumentById(id);

        if ("BIDDER".equalsIgnoreCase(authRole) || "VENDOR".equalsIgnoreCase(authRole)) {
            if (!documentService.isOwnedByBidder(doc, userVendorId, userEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        return ResponseEntity.ok(doc);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "documentType", required = false) String documentType,
            @RequestParam(value = "vendorId", required = false) String vendorId,
            @RequestParam(value = "tenderId", required = false) String tenderId,
            @RequestParam(value = "bidId", required = false) String bidId,
            HttpServletRequest request) {

        String authRole = request.getHeader("X-User-Role");
        String userVendorId = request.getHeader("X-Vendor-Id");

        // Force vendorId to authenticated bidder ID if role is Bidder
        if ("BIDDER".equalsIgnoreCase(authRole) || "VENDOR".equalsIgnoreCase(authRole)) {
            if (userVendorId != null && !userVendorId.isEmpty()) {
                vendorId = userVendorId;
            }
        }

        DocumentResponse response = documentService.uploadDocument(file, title, documentType, vendorId, tenderId, bidId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DocumentResponse> updateDocumentStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateDocStatusRequest request,
            HttpServletRequest req) {

        String authRole = req.getHeader("X-User-Role");
        String userVendorId = req.getHeader("X-Vendor-Id");
        String userEmail = req.getHeader("X-User-Email");

        DocumentResponse doc = documentService.getDocumentById(id);

        if ("BIDDER".equalsIgnoreCase(authRole) || "VENDOR".equalsIgnoreCase(authRole)) {
            if (!documentService.isOwnedByBidder(doc, userVendorId, userEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        DocumentResponse response = documentService.updateDocumentStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String id,
            HttpServletRequest req) {

        String authRole = req.getHeader("X-User-Role");
        String userVendorId = req.getHeader("X-Vendor-Id");
        String userEmail = req.getHeader("X-User-Email");

        DocumentResponse doc = documentService.getDocumentById(id);

        if ("BIDDER".equalsIgnoreCase(authRole) || "VENDOR".equalsIgnoreCase(authRole)) {
            if (!documentService.isOwnedByBidder(doc, userVendorId, userEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}


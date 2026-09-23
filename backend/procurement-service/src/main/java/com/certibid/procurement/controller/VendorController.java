package com.certibid.procurement.controller;

import com.certibid.procurement.dto.response.VendorResponse;
import com.certibid.procurement.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vendors")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @GetMapping
    public ResponseEntity<List<VendorResponse>> getVendors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String riskLevel) {
        List<VendorResponse> vendors = vendorService.getVendors(search, status, riskLevel);
        return ResponseEntity.ok(vendors);
    }

    @GetMapping("/me")
    public ResponseEntity<VendorResponse> getAuthenticatedVendor(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-Vendor-Id", required = false) String vendorId) {
        if (vendorId != null && !vendorId.isEmpty()) {
            VendorResponse vendor = vendorService.getVendorById(vendorId);
            return ResponseEntity.ok(vendor);
        }
        if (userEmail != null && !userEmail.isEmpty()) {
            List<VendorResponse> vendors = vendorService.getVendors(userEmail, null, null);
            if (!vendors.isEmpty()) {
                return ResponseEntity.ok(vendors.get(0));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorResponse> getVendorById(@PathVariable String id) {
        VendorResponse vendor = vendorService.getVendorById(id);
        return ResponseEntity.ok(vendor);
    }
}

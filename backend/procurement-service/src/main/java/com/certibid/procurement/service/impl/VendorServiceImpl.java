package com.certibid.procurement.service.impl;

import com.certibid.procurement.dto.response.VendorResponse;
import com.certibid.procurement.entity.Vendor;
import com.certibid.procurement.exception.ResourceNotFoundException;
import com.certibid.procurement.repository.VendorRepository;
import com.certibid.procurement.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorServiceImpl implements VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    @Override
    public List<VendorResponse> getVendors(String search, String status, String riskLevel) {
        List<Vendor> vendors = vendorRepository.findAll();

        if (status != null && !status.isEmpty()) {
            vendors = vendors.stream()
                    .filter(v -> status.equalsIgnoreCase(v.getVerificationStatus()))
                    .collect(Collectors.toList());
        }

        if (riskLevel != null && !riskLevel.isEmpty()) {
            vendors = vendors.stream()
                    .filter(v -> riskLevel.equalsIgnoreCase(v.getRiskLevel()))
                    .collect(Collectors.toList());
        }

        if (search != null && !search.isEmpty()) {
            String lowerSearch = search.toLowerCase();
            vendors = vendors.stream()
                    .filter(v -> v.getCompanyName().toLowerCase().contains(lowerSearch) ||
                            v.getCategory().toLowerCase().contains(lowerSearch) ||
                            v.getTaxId().toLowerCase().contains(lowerSearch))
                    .collect(Collectors.toList());
        }

        return vendors.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public VendorResponse getVendorById(String id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + id));
        return mapToResponse(vendor);
    }

    private VendorResponse mapToResponse(Vendor vendor) {
        return VendorResponse.builder()
                .id(vendor.getId())
                .companyName(vendor.getCompanyName())
                .registrationNumber(vendor.getRegistrationNumber())
                .taxId(vendor.getTaxId())
                .category(vendor.getCategory())
                .rating(vendor.getRating())
                .eligibilityScore(vendor.getEligibilityScore())
                .riskScore(vendor.getRiskScore())
                .riskLevel(vendor.getRiskLevel())
                .verificationStatus(vendor.getVerificationStatus())
                .financialHealth(vendor.getFinancialHealth())
                .blacklisted(vendor.getBlacklisted())
                .contactPerson(vendor.getContactPerson())
                .email(vendor.getEmail())
                .phone(vendor.getPhone())
                .address(vendor.getAddress())
                .completedProjectsCount(vendor.getCompletedProjectsCount())
                .annualTurnover(vendor.getAnnualTurnover())
                .joinedDate(vendor.getJoinedDate())
                .createdAt(vendor.getCreatedAt())
                .build();
    }
}

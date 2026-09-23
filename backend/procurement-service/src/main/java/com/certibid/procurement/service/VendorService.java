package com.certibid.procurement.service;

import com.certibid.procurement.dto.response.VendorResponse;

import java.util.List;

public interface VendorService {

    List<VendorResponse> getVendors(String search, String status, String riskLevel);

    VendorResponse getVendorById(String id);
}

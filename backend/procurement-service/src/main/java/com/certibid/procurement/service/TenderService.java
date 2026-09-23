package com.certibid.procurement.service;

import com.certibid.procurement.dto.request.AwardContractRequest;
import com.certibid.procurement.dto.request.CreateTenderRequest;
import com.certibid.procurement.dto.response.TenderResponse;

import java.util.List;
import java.util.Map;

public interface TenderService {

    List<TenderResponse> getTenders(String search, String status, String riskLevel);

    TenderResponse getTenderById(String id);

    TenderResponse createTender(CreateTenderRequest request, String userId);

    TenderResponse updateTender(String id, Map<String, Object> updates);

    Map<String, Object> awardContract(String tenderId, AwardContractRequest request);
}

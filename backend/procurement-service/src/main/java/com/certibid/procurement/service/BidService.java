package com.certibid.procurement.service;

import com.certibid.procurement.dto.request.SubmitBidRequest;
import com.certibid.procurement.dto.response.BidResponse;

import java.util.List;

public interface BidService {

    List<BidResponse> getBids(String tenderId, String vendorId);

    BidResponse getBidById(String id);

    BidResponse submitBid(SubmitBidRequest request);
}

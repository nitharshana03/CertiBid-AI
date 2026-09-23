package com.certibid.risk.service;

import com.certibid.risk.dto.response.ExternalBidDetailDto;

import java.util.Map;

public interface GeminiAiService {
    Map<String, Object> analyzeBidRisk(ExternalBidDetailDto bidDetails);
}

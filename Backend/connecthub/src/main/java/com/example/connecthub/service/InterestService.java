package com.example.connecthub.service;

import com.example.connecthub.dto.request.CreateInterestRequest;
import com.example.connecthub.dto.request.UpdateInterestRequest;
import com.example.connecthub.dto.response.InterestResponse;

import java.util.List;

public interface InterestService {

    InterestResponse createInterest(CreateInterestRequest request);

    List<InterestResponse> getAllInterests();

    InterestResponse getInterestById(Long id);

    InterestResponse updateInterest(
            Long id,
            UpdateInterestRequest request
    );

    void deleteInterest(Long id);
}
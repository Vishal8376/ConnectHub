package com.example.connecthub.service;

import com.example.connecthub.dto.response.RecommendationResponse;

import java.util.List;

public interface RecommendationService {

    List<RecommendationResponse> getRecommendations(String email);
}
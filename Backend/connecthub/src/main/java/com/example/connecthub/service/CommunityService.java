package com.example.connecthub.service;

import com.example.connecthub.dto.request.CreateCommunityRequest;
import com.example.connecthub.dto.request.UpdateCommunityRequest;
import com.example.connecthub.dto.response.CommunityResponse;

import java.util.List;

public interface CommunityService {

    CommunityResponse createCommunity(
            String email,
            CreateCommunityRequest request);

    List<CommunityResponse> getAllCommunities();

    CommunityResponse getCommunityById(Long id);

    CommunityResponse updateCommunity(
            Long id,
            String email,
            UpdateCommunityRequest request);

    void deleteCommunity(
            Long id,
            String email);

    void joinCommunity(
            Long id,
            String email);

    void leaveCommunity(
            Long id,
            String email);
}
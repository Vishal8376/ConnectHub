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

    com.example.connecthub.dto.response.CommunityJoinRequestResponse createJoinRequest(Long communityId, String email);

    List<com.example.connecthub.dto.response.CommunityJoinRequestResponse> getJoinRequestsForCommunity(Long communityId, String email);

    com.example.connecthub.dto.response.CommunityJoinRequestResponse acceptJoinRequest(Long requestId, String email);

    com.example.connecthub.dto.response.CommunityJoinRequestResponse rejectJoinRequest(Long requestId, String email);

    void cancelJoinRequest(Long communityId, String email);
}
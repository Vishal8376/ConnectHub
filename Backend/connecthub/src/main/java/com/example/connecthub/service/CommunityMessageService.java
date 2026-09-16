package com.example.connecthub.service;

import com.example.connecthub.dto.response.CommunityMessageResponse;

import java.util.List;

public interface CommunityMessageService {

    List<CommunityMessageResponse> getCommunityMessageHistory(Long communityId, String email);

    CommunityMessageResponse saveAndMapCommunityMessage(Long communityId, String email, String content);

    boolean isUserMemberOfCommunity(Long communityId, String email);
}

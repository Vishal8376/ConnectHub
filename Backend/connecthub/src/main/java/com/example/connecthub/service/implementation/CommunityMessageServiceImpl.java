package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.response.CommunityMessageResponse;
import com.example.connecthub.entity.Community;
import com.example.connecthub.entity.CommunityMessage;
import com.example.connecthub.entity.User;
import com.example.connecthub.exception.CommunityAccessDeniedException;
import com.example.connecthub.exception.CommunityNotFoundException;
import com.example.connecthub.exception.UserNotFoundException;
import com.example.connecthub.repository.CommunityMessageRepository;
import com.example.connecthub.repository.CommunityRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.CommunityMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityMessageServiceImpl implements CommunityMessageService {

    private final CommunityMessageRepository communityMessageRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CommunityMessageResponse> getCommunityMessageHistory(Long communityId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        if (!checkMembership(community, user)) {
            throw new CommunityAccessDeniedException("Only community members can view community chat messages.");
        }

        return communityMessageRepository.findByCommunityIdOrderBySentAtAsc(communityId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public CommunityMessageResponse saveAndMapCommunityMessage(Long communityId, String email, String content) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        if (!checkMembership(community, user)) {
            throw new CommunityAccessDeniedException("Only community members can send community chat messages.");
        }

        CommunityMessage msg = CommunityMessage.builder()
                .community(community)
                .sender(user)
                .content(content)
                .sentAt(LocalDateTime.now())
                .build();

        CommunityMessage saved = communityMessageRepository.save(msg);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserMemberOfCommunity(Long communityId, String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        Community community = communityRepository.findById(communityId).orElse(null);
        if (user == null || community == null) return false;
        return checkMembership(community, user);
    }

    private boolean checkMembership(Community community, User user) {
        boolean isCreator = community.getCreator() != null && community.getCreator().getId().equals(user.getId());
        boolean isMember = community.getUsers() != null && community.getUsers().stream().anyMatch(u -> u.getId().equals(user.getId()));
        return isCreator || isMember;
    }

    private CommunityMessageResponse mapToResponse(CommunityMessage msg) {
        return CommunityMessageResponse.builder()
                .id(msg.getId())
                .communityId(msg.getCommunity().getId())
                .senderId(msg.getSender().getId())
                .senderName(msg.getSender().getFullName())
                .senderProfilePicture(msg.getSender().getProfilePicture())
                .content(msg.getContent())
                .sentAt(msg.getSentAt())
                .build();
    }
}

package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.request.CreateCommunityRequest;
import com.example.connecthub.dto.request.UpdateCommunityRequest;
import com.example.connecthub.dto.response.CommunityJoinRequestResponse;
import com.example.connecthub.dto.response.CommunityResponse;
import com.example.connecthub.entity.Community;
import com.example.connecthub.entity.CommunityJoinRequest;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.CommunityVisibility;
import com.example.connecthub.enums.JoinRequestStatus;
import com.example.connecthub.exception.CommunityAccessDeniedException;
import com.example.connecthub.exception.CommunityNotFoundException;
import com.example.connecthub.exception.UserNotFoundException;
import com.example.connecthub.repository.CommunityJoinRequestRepository;
import com.example.connecthub.repository.CommunityRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final CommunityJoinRequestRepository communityJoinRequestRepository;

    @Override
    @Transactional
    public CommunityResponse createCommunity(
            String email,
            CreateCommunityRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Community community = Community.builder()
                .name(request.getName())
                .description(request.getDescription())
                .communityImage(request.getCommunityImage())
                .visibility(request.getVisibility())
                .creator(user)
                .users(new HashSet<>())
                .build();

        // Creator automatically becomes the first member
        community.getUsers().add(user);

        Community savedCommunity = communityRepository.save(community);

        // Maintain User side of the relationship
        user.getCommunities().add(savedCommunity);
        userRepository.save(user);

        return mapToResponse(savedCommunity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommunityResponse> getAllCommunities() {

        return communityRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityResponse getCommunityById(Long id) {

        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        return mapToResponse(community);
    }

    @Override
    @Transactional
    public CommunityResponse updateCommunity(
            Long id,
            String email,
            UpdateCommunityRequest request) {

        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        if (!community.getCreator().getEmail().equals(email)) {
            throw new CommunityAccessDeniedException(
                    "Only the creator can update the community");
        }

        community.setName(request.getName());
        community.setDescription(request.getDescription());
        community.setCommunityImage(request.getCommunityImage());
        community.setVisibility(request.getVisibility());

        Community updatedCommunity = communityRepository.save(community);

        return mapToResponse(updatedCommunity);
    }

    @Override
    @Transactional
    public void deleteCommunity(
            Long id,
            String email) {

        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        if (!community.getCreator().getEmail().equals(email)) {
            throw new CommunityAccessDeniedException(
                    "Only the creator can delete the community");
        }

        List<User> members = new ArrayList<>(community.getUsers());

        for (User user : members) {
            user.getCommunities().remove(community);
        }

        community.getUsers().clear();

        userRepository.saveAll(members);

        communityRepository.delete(community);
    }

    @Override
    @Transactional
    public void joinCommunity(
            Long id,
            String email) {

        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException(
                        "Community not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found"));

        if (community.getVisibility() == CommunityVisibility.PRIVATE) {
            throw new CommunityAccessDeniedException(
                    "Private communities cannot be joined directly. Please submit a join request.");
        }

        if (community.getUsers() == null) {
            community.setUsers(new HashSet<>());
        }
        if (user.getCommunities() == null) {
            user.setCommunities(new HashSet<>());
        }
        community.getUsers().add(user);
        user.getCommunities().add(community);


        communityRepository.save(community);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void leaveCommunity(
            Long id,
            String email) {

        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        boolean isMember = community.getUsers() != null && community.getUsers().stream().anyMatch(u -> u.getId().equals(user.getId()));
        if (!isMember) {
            throw new CommunityAccessDeniedException(
                    "You are not a member of this community");
        }

        community.getUsers().removeIf(u -> u.getId().equals(user.getId()));
        user.getCommunities().removeIf(c -> c.getId().equals(community.getId()));

        communityRepository.save(community);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public CommunityJoinRequestResponse createJoinRequest(Long communityId, String email) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        boolean isMember = (community.getCreator() != null && community.getCreator().getId().equals(user.getId()))
                || (community.getUsers() != null && community.getUsers().stream().anyMatch(u -> u.getId().equals(user.getId())));

        if (isMember) {
            throw new CommunityAccessDeniedException("Already a member of this community");
        }

        if (community.getVisibility() == CommunityVisibility.PUBLIC) {
            // Direct join for public
            joinCommunity(communityId, email);
            return CommunityJoinRequestResponse.builder()
                    .communityId(communityId)
                    .communityName(community.getName())
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .profilePicture(user.getProfilePicture())
                    .profession(user.getProfession())
                    .status(JoinRequestStatus.ACCEPTED)
                    .build();
        }

        Optional<CommunityJoinRequest> existingPending = communityJoinRequestRepository
                .findByCommunityIdAndUserIdAndStatus(communityId, user.getId(), JoinRequestStatus.PENDING);

        if (existingPending.isPresent()) {
            throw new CommunityAccessDeniedException("Join request already pending");
        }

        CommunityJoinRequest joinRequest = CommunityJoinRequest.builder()
                .community(community)
                .user(user)
                .status(JoinRequestStatus.PENDING)
                .build();

        CommunityJoinRequest saved = communityJoinRequestRepository.save(joinRequest);
        return mapToJoinRequestResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommunityJoinRequestResponse> getJoinRequestsForCommunity(Long communityId, String email) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!community.getCreator().getId().equals(user.getId())) {
            throw new CommunityAccessDeniedException("Only the community creator can view join requests");
        }

        return communityJoinRequestRepository.findByCommunityIdAndStatusOrderByCreatedAtDesc(communityId, JoinRequestStatus.PENDING)
                .stream()
                .map(this::mapToJoinRequestResponse)
                .toList();
    }

    @Override
    @Transactional
    public CommunityJoinRequestResponse acceptJoinRequest(Long requestId, String email) {
        CommunityJoinRequest joinRequest = communityJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new CommunityNotFoundException("Join request not found"));

        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Community community = joinRequest.getCommunity();

        if (!community.getCreator().getId().equals(creator.getId())) {
            throw new CommunityAccessDeniedException("Only the community creator can accept join requests");
        }

        if (joinRequest.getStatus() != JoinRequestStatus.PENDING) {
            throw new CommunityAccessDeniedException("Join request is not pending");
        }

        joinRequest.setStatus(JoinRequestStatus.ACCEPTED);
        CommunityJoinRequest saved = communityJoinRequestRepository.save(joinRequest);

        User requester = joinRequest.getUser();
        if (community.getUsers() == null) {
            community.setUsers(new HashSet<>());
        }
        if (requester.getCommunities() == null) {
            requester.setCommunities(new HashSet<>());
        }
        community.getUsers().add(requester);
        requester.getCommunities().add(community);


        communityRepository.save(community);
        userRepository.save(requester);

        return mapToJoinRequestResponse(saved);
    }

    @Override
    @Transactional
    public CommunityJoinRequestResponse rejectJoinRequest(Long requestId, String email) {
        CommunityJoinRequest joinRequest = communityJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new CommunityNotFoundException("Join request not found"));

        User creator = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Community community = joinRequest.getCommunity();

        if (!community.getCreator().getId().equals(creator.getId())) {
            throw new CommunityAccessDeniedException("Only the community creator can reject join requests");
        }

        joinRequest.setStatus(JoinRequestStatus.REJECTED);
        CommunityJoinRequest saved = communityJoinRequestRepository.save(joinRequest);

        return mapToJoinRequestResponse(saved);
    }

    @Override
    @Transactional
    public void cancelJoinRequest(Long communityId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Optional<CommunityJoinRequest> pending = communityJoinRequestRepository
                .findByCommunityIdAndUserIdAndStatus(communityId, user.getId(), JoinRequestStatus.PENDING);

        pending.ifPresent(communityJoinRequestRepository::delete);
    }

    private CommunityJoinRequestResponse mapToJoinRequestResponse(CommunityJoinRequest request) {
        return CommunityJoinRequestResponse.builder()
                .requestId(request.getId())
                .communityId(request.getCommunity().getId())
                .communityName(request.getCommunity().getName())
                .userId(request.getUser().getId())
                .fullName(request.getUser().getFullName())
                .profilePicture(request.getUser().getProfilePicture())
                .profession(request.getUser().getProfession())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }

    private String getCurrentUserEmailSafely() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                return auth.getName();
            }
        } catch (Exception e) {
            // Fail safely
        }
        return null;
    }

    private CommunityResponse mapToResponse(
            Community community) {

        String currentEmail = getCurrentUserEmailSafely();
        boolean isMember = false;
        boolean isCreator = false;
        String joinRequestStatus = null;

        if (currentEmail != null) {
            User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
            if (currentUser != null) {
                isCreator = community.getCreator() != null && community.getCreator().getId().equals(currentUser.getId());
                isMember = isCreator || (community.getUsers() != null && community.getUsers().stream().anyMatch(u -> u.getId().equals(currentUser.getId())));

                if (!isMember) {
                    Optional<CommunityJoinRequest> lastReq = communityJoinRequestRepository
                            .findTopByCommunityIdAndUserIdOrderByCreatedAtDesc(community.getId(), currentUser.getId());
                    if (lastReq.isPresent()) {
                        joinRequestStatus = lastReq.get().getStatus().name();
                    }
                }
            }
        }

        return CommunityResponse.builder()
                .id(community.getId())
                .name(community.getName())
                .description(community.getDescription())
                .communityImage(community.getCommunityImage())
                .visibility(community.getVisibility())
                .creatorName(community.getCreator() != null ? community.getCreator().getFullName() : null)
                .memberCount((long) (community.getUsers() != null ? community.getUsers().size() : 0))
                .isMember(isMember)
                .isCreator(isCreator)
                .joinRequestStatus(joinRequestStatus)
                .build();
    }
}
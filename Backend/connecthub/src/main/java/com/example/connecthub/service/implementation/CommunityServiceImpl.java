package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.request.CreateCommunityRequest;
import com.example.connecthub.dto.request.UpdateCommunityRequest;
import com.example.connecthub.dto.response.CommunityResponse;
import com.example.connecthub.entity.Community;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.CommunityVisibility;
import com.example.connecthub.exception.CommunityAccessDeniedException;
import com.example.connecthub.exception.CommunityNotFoundException;
import com.example.connecthub.exception.UserNotFoundException;
import com.example.connecthub.repository.CommunityRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityServiceImpl implements CommunityService {

        private final CommunityRepository communityRepository;
        private final UserRepository userRepository;

        @Override
        public CommunityResponse createCommunity(
                        String email,
                        CreateCommunityRequest request) {

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

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
        public List<CommunityResponse> getAllCommunities() {

                return communityRepository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        public CommunityResponse getCommunityById(Long id) {

                Community community = communityRepository.findById(id)
                                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

                return mapToResponse(community);
        }

        @Override
        public CommunityResponse updateCommunity(
                        Long id,
                        String email,
                        UpdateCommunityRequest request) {

                Community community = communityRepository.findById(id)
                                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

                if (!community.getCreator().getEmail().equals(email)) {
                        throw new RuntimeException(
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
        public void deleteCommunity(
                        Long id,
                        String email) {

                Community community = communityRepository.findById(id)
                                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

                if (!community.getCreator().getEmail().equals(email)) {
                        throw new RuntimeException(
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
                                        "Private communities cannot be joined directly");
                }

                community.getUsers().add(user);
                user.getCommunities().add(community);

                communityRepository.save(community);
                userRepository.save(user);
        }

        @Override
        public void leaveCommunity(
                        Long id,
                        String email) {

                Community community = communityRepository.findById(id)
                                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                community.getUsers().remove(user);
                user.getCommunities().remove(community);

                if (!community.getUsers().contains(user)) {
                        throw new CommunityAccessDeniedException(
                                        "You are not a member of this community");
                }

                communityRepository.save(community);
                userRepository.save(user);
        }

        private CommunityResponse mapToResponse(
                        Community community) {

                return CommunityResponse.builder()
                                .id(community.getId())
                                .name(community.getName())
                                .description(community.getDescription())
                                .communityImage(community.getCommunityImage())
                                .visibility(community.getVisibility())
                                .creatorName(community.getCreator().getFullName())
                                .memberCount((long) community.getUsers().size())
                                .build();
        }
}
package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.response.CommunityAutocompleteResponse;
import com.example.connecthub.dto.response.SearchAutocompleteResponse;
import com.example.connecthub.dto.response.UserAutocompleteResponse;
import com.example.connecthub.entity.Community;
import com.example.connecthub.entity.User;
import com.example.connecthub.repository.CommunityRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;

    @Override
    @Transactional(readOnly = true)
    public SearchAutocompleteResponse autocomplete(String query) {
        if (query == null || query.trim().isEmpty()) {
            return SearchAutocompleteResponse.builder()
                    .users(Collections.emptyList())
                    .communities(Collections.emptyList())
                    .build();
        }

        String trimmedQuery = query.trim();

        List<UserAutocompleteResponse> userResponses = userRepository
                .findTop5ByFullNameStartingWithIgnoreCaseOrderByFullNameAsc(trimmedQuery)
                .stream()
                .map(this::mapToUserAutocompleteResponse)
                .toList();

        List<CommunityAutocompleteResponse> communityResponses = communityRepository
                .findTop5ByNameStartingWithIgnoreCaseOrderByNameAsc(trimmedQuery)
                .stream()
                .map(this::mapToCommunityAutocompleteResponse)
                .toList();

        return SearchAutocompleteResponse.builder()
                .users(userResponses)
                .communities(communityResponses)
                .build();
    }

    private UserAutocompleteResponse mapToUserAutocompleteResponse(User user) {
        return UserAutocompleteResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .profilePicture(user.getProfilePicture())
                .profession(user.getProfession())
                .college(user.getCollege())
                .build();
    }

    private CommunityAutocompleteResponse mapToCommunityAutocompleteResponse(Community community) {
        long memberCount = community.getUsers() != null ? community.getUsers().size() : 0;
        return CommunityAutocompleteResponse.builder()
                .id(community.getId())
                .name(community.getName())
                .communityImage(community.getCommunityImage())
                .visibility(community.getVisibility())
                .memberCount(memberCount)
                .description(community.getDescription())
                .build();
    }
}

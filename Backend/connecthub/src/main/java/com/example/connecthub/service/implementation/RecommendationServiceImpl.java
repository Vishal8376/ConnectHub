package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.response.RecommendationResponse;
import com.example.connecthub.entity.User;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final UserRepository userRepository;

    @Override
    public List<RecommendationResponse> getRecommendations(String email) {

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(user -> buildRecommendation(currentUser, user))
                .filter(recommendation -> recommendation.getMatchScore() > 0)
                .sorted((a, b) ->
                        Integer.compare(
                                b.getMatchScore(),
                                a.getMatchScore()))
                .toList();
    }

    private RecommendationResponse buildRecommendation(
            User currentUser,
            User candidate) {

        int score = 0;

        // Same college
        if (isSame(currentUser.getCollege(), candidate.getCollege())) {
            score += 2;
        }

        // Same profession
        if (isSame(
                currentUser.getProfession(),
                candidate.getProfession())) {
            score += 2;
        }

        // Same location
        if (isSame(
                currentUser.getLocation(),
                candidate.getLocation())) {
            score += 1;
        }

        // Common interests
        score += calculateCommonInterests(
                currentUser,
                candidate);

        return RecommendationResponse.builder()
                .userId(candidate.getId())
                .fullName(candidate.getFullName())
                .bio(candidate.getBio())
                .college(candidate.getCollege())
                .profession(candidate.getProfession())
                .location(candidate.getLocation())
                .profilePicture(candidate.getProfilePicture())
                .matchScore(score)
                .build();
    }

    private int calculateCommonInterests(
            User currentUser,
            User candidate) {

        if (currentUser.getInterests() == null ||
                candidate.getInterests() == null) {
            return 0;
        }

        Set<Long> currentInterestIds = new HashSet<>();

        currentUser.getInterests()
                .forEach(interest ->
                        currentInterestIds.add(interest.getId()));

        int commonInterests = 0;

        for (var interest : candidate.getInterests()) {
            if (currentInterestIds.contains(interest.getId())) {
                commonInterests++;
            }
        }

        return commonInterests * 3;
    }

    private boolean isSame(String first, String second) {

        return first != null
                && second != null
                && first.equalsIgnoreCase(second);
    }
}
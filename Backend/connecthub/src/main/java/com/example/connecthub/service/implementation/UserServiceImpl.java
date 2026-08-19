package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.request.RegisterRequest;
import com.example.connecthub.dto.request.UpdateProfileRequest;
import com.example.connecthub.dto.response.UserProfileResponse;
import com.example.connecthub.dto.response.UserResponse;
import com.example.connecthub.dto.response.UserSearchResponse;
import com.example.connecthub.entity.Interest;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.Role;
import com.example.connecthub.exception.EmailAlreadyExistsException;
import com.example.connecthub.repository.InterestRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.UserService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final InterestRepository interestRepository;

    @Override
    public UserResponse register(RegisterRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered.");
        }

        // Convert DTO -> Entity
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .bio(request.getBio())
                .college(request.getCollege())
                .profession(request.getProfession())
                .location(request.getLocation())
                .profilePicture(request.getProfilePicture())
                .role(Role.ROLE_USER)
                .build();

        // Save User
        User savedUser = userRepository.save(user);

        return mapToUserResponse(savedUser);
    }

    @Override
    public UserProfileResponse getCurrentUserProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return mapToUserProfileResponse(user);
    }

    /**
     * Converts User Entity -> UserResponse DTO
     */
    private UserResponse mapToUserResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .bio(user.getBio())
                .college(user.getCollege())
                .profession(user.getProfession())
                .location(user.getLocation())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    /**
     * Converts User Entity -> UserProfileResponse DTO
     */
    private UserProfileResponse mapToUserProfileResponse(User user) {

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .bio(user.getBio())
                .college(user.getCollege())
                .profession(user.getProfession())
                .location(user.getLocation())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    @Override
    public UserProfileResponse updateProfile(
            String email,
            UpdateProfileRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.getFullName());
        user.setBio(request.getBio());
        user.setCollege(request.getCollege());
        user.setProfession(request.getProfession());
        user.setLocation(request.getLocation());
        user.setProfilePicture(request.getProfilePicture());

        if (request.getInterestIds() != null) {

            Set<Interest> interests = new HashSet<>(
                    interestRepository.findAllById(request.getInterestIds()));

            user.setInterests(interests);
        }

        User updatedUser = userRepository.save(user);

        return mapToUserProfileResponse(updatedUser);
    }

    @Override
    public List<UserSearchResponse> searchUsers(
            String name,
            String college,
            String profession,
            String location,
            Long interestId) {

        return userRepository.searchUsers(
                name,
                college,
                profession,
                location,
                interestId)
                .stream()
                .map(this::mapToUserSearchResponse)
                .toList();
    }

    private UserSearchResponse mapToUserSearchResponse(User user) {

        return UserSearchResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .bio(user.getBio())
                .college(user.getCollege())
                .profession(user.getProfession())
                .location(user.getLocation())
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
package com.example.connecthub.service;

import java.util.List;

import com.example.connecthub.dto.request.RegisterRequest;
import com.example.connecthub.dto.request.UpdateProfileRequest;
import com.example.connecthub.dto.response.UserProfileResponse;
import com.example.connecthub.dto.response.UserResponse;
import com.example.connecthub.dto.response.UserSearchResponse;

public interface UserService {

    UserResponse register(RegisterRequest request);

    UserProfileResponse getCurrentUserProfile(String email);

    UserProfileResponse updateProfile(
            String email,
            UpdateProfileRequest request);

    List<UserSearchResponse> searchUsers(
            String name,
            String college,
            String profession,
            String location,
            Long interestId);
}
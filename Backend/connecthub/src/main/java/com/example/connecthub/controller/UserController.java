package com.example.connecthub.controller;

import com.example.connecthub.dto.request.RegisterRequest;
import com.example.connecthub.dto.request.UpdateProfileRequest;
import com.example.connecthub.dto.response.UserProfileResponse;
import com.example.connecthub.dto.response.UserResponse;
import com.example.connecthub.dto.response.UserSearchResponse;
import com.example.connecthub.security.UserDetailsImpl;
import com.example.connecthub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * User Registration
     */
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse response = userService.register(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get Logged-in User Profile
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        UserProfileResponse response = userService.getCurrentUserProfile(
                userDetails.getUsername());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserProfileResponse response = userService.updateProfile(
                userDetails.getUsername(),
                request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String profession,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Long interestId) {

        return ResponseEntity.ok(
                userService.searchUsers(
                        name,
                        college,
                        profession,
                        location,
                        interestId));
    }
}
package com.example.connecthub.controller;

import com.example.connecthub.dto.request.CreateCommunityRequest;
import com.example.connecthub.dto.request.UpdateCommunityRequest;
import com.example.connecthub.dto.response.CommunityJoinRequestResponse;
import com.example.connecthub.dto.response.CommunityResponse;
import com.example.connecthub.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping
    public ResponseEntity<CommunityResponse> createCommunity(
            @Valid @RequestBody CreateCommunityRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return new ResponseEntity<>(
                communityService.createCommunity(email, request),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<CommunityResponse>> getAllCommunities() {

        return ResponseEntity.ok(
                communityService.getAllCommunities()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityResponse> getCommunityById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                communityService.getCommunityById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommunityResponse> updateCommunity(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommunityRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return ResponseEntity.ok(
                communityService.updateCommunity(id, email, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommunity(
            @PathVariable Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        communityService.deleteCommunity(id, email);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<String> joinCommunity(
            @PathVariable Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        communityService.joinCommunity(id, email);

        return ResponseEntity.ok("Joined community successfully");
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<String> leaveCommunity(
            @PathVariable Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        communityService.leaveCommunity(id, email);

        return ResponseEntity.ok("Left community successfully");
    }

    @PostMapping("/{communityId}/join-request")
    public ResponseEntity<CommunityJoinRequestResponse> createJoinRequest(
            @PathVariable Long communityId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return new ResponseEntity<>(
                communityService.createJoinRequest(communityId, email),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{communityId}/join-requests")
    public ResponseEntity<List<CommunityJoinRequestResponse>> getJoinRequests(
            @PathVariable Long communityId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return ResponseEntity.ok(
                communityService.getJoinRequestsForCommunity(communityId, email)
        );
    }

    @PutMapping("/join-requests/{requestId}/accept")
    public ResponseEntity<CommunityJoinRequestResponse> acceptJoinRequest(
            @PathVariable Long requestId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return ResponseEntity.ok(
                communityService.acceptJoinRequest(requestId, email)
        );
    }

    @PutMapping("/join-requests/{requestId}/reject")
    public ResponseEntity<CommunityJoinRequestResponse> rejectJoinRequest(
            @PathVariable Long requestId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return ResponseEntity.ok(
                communityService.rejectJoinRequest(requestId, email)
        );
    }

    @DeleteMapping("/{communityId}/join-request")
    public ResponseEntity<Void> cancelJoinRequest(
            @PathVariable Long communityId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        communityService.cancelJoinRequest(communityId, email);

        return ResponseEntity.noContent().build();
    }
}
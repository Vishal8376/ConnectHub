package com.example.connecthub.controller;

import com.example.connecthub.dto.response.CommunityMessageResponse;
import com.example.connecthub.service.CommunityMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
public class CommunityMessageController {

    private final CommunityMessageService communityMessageService;

    @GetMapping("/{communityId}/messages")
    public ResponseEntity<List<CommunityMessageResponse>> getCommunityMessages(
            @PathVariable Long communityId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        return ResponseEntity.ok(
                communityMessageService.getCommunityMessageHistory(communityId, email)
        );
    }
}

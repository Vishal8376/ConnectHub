package com.example.connecthub.controller;

import com.example.connecthub.dto.response.ConnectionResponse;
import com.example.connecthub.dto.response.ConnectionUserResponse;
import com.example.connecthub.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/connections")
@RequiredArgsConstructor
public class ConnectionController {

    private final ConnectionService connectionService;

    @PostMapping("/{userId}")
    public ResponseEntity<ConnectionResponse> sendConnectionRequest(
            @PathVariable Long userId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return new ResponseEntity<>(
                connectionService.sendConnectionRequest(email, userId),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/received")
    public ResponseEntity<List<ConnectionUserResponse>> getReceivedRequests() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return ResponseEntity.ok(
                connectionService.getReceivedRequests(email)
        );
    }

    @GetMapping("/sent")
    public ResponseEntity<List<ConnectionUserResponse>> getSentRequests() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return ResponseEntity.ok(
                connectionService.getSentRequests(email)
        );
    }

    @GetMapping
    public ResponseEntity<List<ConnectionUserResponse>> getConnections() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return ResponseEntity.ok(
                connectionService.getConnections(email)
        );
    }

    @PutMapping("/{connectionId}/accept")
    public ResponseEntity<ConnectionResponse> acceptConnection(
            @PathVariable Long connectionId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return ResponseEntity.ok(
                connectionService.acceptConnection(
                        connectionId,
                        email
                )
        );
    }

    @PutMapping("/{connectionId}/reject")
    public ResponseEntity<ConnectionResponse> rejectConnection(
            @PathVariable Long connectionId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return ResponseEntity.ok(
                connectionService.rejectConnection(
                        connectionId,
                        email
                )
        );
    }

    @DeleteMapping("/{connectionId}")
    public ResponseEntity<Void> removeConnection(
            @PathVariable Long connectionId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        connectionService.removeConnection(
                connectionId,
                email
        );

        return ResponseEntity.noContent().build();
    }
}
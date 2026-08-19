package com.example.connecthub.controller;

import com.example.connecthub.dto.request.CreateInterestRequest;
import com.example.connecthub.dto.request.UpdateInterestRequest;
import com.example.connecthub.dto.response.InterestResponse;
import com.example.connecthub.service.InterestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/interests")
@RequiredArgsConstructor
public class AdminInterestController {

    private final InterestService interestService;

    @PostMapping
    public ResponseEntity<InterestResponse> createInterest(
            @Valid @RequestBody CreateInterestRequest request) {

        InterestResponse response = interestService.createInterest(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<InterestResponse>> getAllInterests() {

        return ResponseEntity.ok(
                interestService.getAllInterests()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterestResponse> getInterestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                interestService.getInterestById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterestResponse> updateInterest(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInterestRequest request) {

        return ResponseEntity.ok(
                interestService.updateInterest(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterest(
            @PathVariable Long id) {

        interestService.deleteInterest(id);

        return ResponseEntity.noContent().build();
    }
}
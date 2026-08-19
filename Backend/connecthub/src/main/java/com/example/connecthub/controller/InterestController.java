package com.example.connecthub.controller;

import com.example.connecthub.dto.response.InterestResponse;
import com.example.connecthub.service.InterestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interests")
@RequiredArgsConstructor
public class InterestController {

    private final InterestService interestService;

    @GetMapping
    public ResponseEntity<List<InterestResponse>> getAllInterests() {

        return ResponseEntity.ok(
                interestService.getAllInterests()
        );
    }
}
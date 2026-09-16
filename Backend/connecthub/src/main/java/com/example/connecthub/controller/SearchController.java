package com.example.connecthub.controller;

import com.example.connecthub.dto.response.SearchAutocompleteResponse;
import com.example.connecthub.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/autocomplete")
    public ResponseEntity<SearchAutocompleteResponse> autocomplete(
            @RequestParam(name = "q", required = false) String q) {
        return ResponseEntity.ok(searchService.autocomplete(q));
    }
}

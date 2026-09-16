package com.example.connecthub.service;

import com.example.connecthub.dto.response.SearchAutocompleteResponse;

public interface SearchService {
    SearchAutocompleteResponse autocomplete(String query);
}

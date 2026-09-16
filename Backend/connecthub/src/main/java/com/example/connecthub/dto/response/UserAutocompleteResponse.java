package com.example.connecthub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAutocompleteResponse {
    private Long id;
    private String fullName;
    private String profilePicture;
    private String profession;
    private String college;
}

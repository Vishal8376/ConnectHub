package com.example.connecthub.dto.response;

import com.example.connecthub.enums.CommunityVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityAutocompleteResponse {
    private Long id;
    private String name;
    private String communityImage;
    private CommunityVisibility visibility;
    private Long memberCount;
    private String description;
}

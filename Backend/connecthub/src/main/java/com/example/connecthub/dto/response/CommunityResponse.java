package com.example.connecthub.dto.response;

import com.example.connecthub.enums.CommunityVisibility;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommunityResponse {

    private Long id;

    private String name;

    private String description;

    private String communityImage;

    private CommunityVisibility visibility;

    private String creatorName;

    private Long memberCount;
}
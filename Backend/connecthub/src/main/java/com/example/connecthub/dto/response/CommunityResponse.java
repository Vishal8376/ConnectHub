package com.example.connecthub.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.example.connecthub.enums.CommunityVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityResponse {

    private Long id;

    private String name;

    private String description;

    private String communityImage;

    private CommunityVisibility visibility;

    private String creatorName;

    private Long memberCount;

    @JsonProperty("isMember")
    private Boolean isMember;

    @JsonProperty("isCreator")
    private Boolean isCreator;

    private String joinRequestStatus;
}
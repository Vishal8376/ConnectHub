package com.example.connecthub.dto.request;

import com.example.connecthub.enums.CommunityVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCommunityRequest {

    @NotBlank(message = "Community name is required")
    @Size(max = 100, message = "Community name cannot exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private String communityImage;

    @NotNull(message = "Visibility is required")
    private CommunityVisibility visibility;
}
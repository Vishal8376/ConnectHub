package com.example.connecthub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityMessageRequest {

    @NotNull(message = "Community ID is required")
    private Long communityId;

    @NotBlank(message = "Message content cannot be blank")
    private String content;
}

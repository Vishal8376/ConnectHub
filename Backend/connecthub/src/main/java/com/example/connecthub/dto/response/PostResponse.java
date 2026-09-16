package com.example.connecthub.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private Long id;

    private String title;

    private String content;

    private String imageUrl;

    private String author;

    private String community;

    private Long communityId;

    private LocalDateTime createdAt;

    private Long likeCount;

    @JsonProperty("likedByCurrentUser")
    private Boolean likedByCurrentUser;
}
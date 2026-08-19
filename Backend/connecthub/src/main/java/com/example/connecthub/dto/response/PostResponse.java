package com.example.connecthub.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostResponse {

    private Long id;

    private String title;

    private String content;

    private String imageUrl;

    private String author;

    private String community;

    private LocalDateTime createdAt;
}
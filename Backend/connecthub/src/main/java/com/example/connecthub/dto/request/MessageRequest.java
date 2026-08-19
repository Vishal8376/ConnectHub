package com.example.connecthub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRequest {

    private Long conversationId;

    private Long receiverId;

    @NotBlank(message = "Message content cannot be empty")
    private String content;
}
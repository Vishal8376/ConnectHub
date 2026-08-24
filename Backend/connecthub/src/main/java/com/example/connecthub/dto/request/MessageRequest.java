package com.example.connecthub.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageRequest {

    @NotNull(message = "Receiver is required")
    private Long receiverId;

    @NotBlank(message = "Message content cannot be empty")
    private String content;
}
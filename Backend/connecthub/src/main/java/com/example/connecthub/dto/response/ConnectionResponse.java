package com.example.connecthub.dto.response;

import com.example.connecthub.enums.ConnectionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConnectionResponse {

    private Long id;

    private Long senderId;
    private String senderName;

    private Long receiverId;
    private String receiverName;

    private ConnectionStatus status;

    private LocalDateTime createdAt;
}
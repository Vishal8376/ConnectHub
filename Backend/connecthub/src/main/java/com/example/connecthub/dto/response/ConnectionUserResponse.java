package com.example.connecthub.dto.response;

import com.example.connecthub.enums.ConnectionStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConnectionUserResponse {

    private Long connectionId;

    private Long userId;

    private String fullName;

    private String profilePicture;

    private ConnectionStatus status;
}
package com.example.connecthub.service;

import com.example.connecthub.dto.response.ConnectionResponse;
import com.example.connecthub.dto.response.ConnectionUserResponse;

import java.util.List;

public interface ConnectionService {

    ConnectionResponse sendConnectionRequest(
            String email,
            Long receiverId
    );

    List<ConnectionUserResponse> getReceivedRequests(
            String email
    );

    List<ConnectionUserResponse> getSentRequests(
            String email
    );

    List<ConnectionUserResponse> getConnections(
            String email
    );

    ConnectionResponse acceptConnection(
            Long connectionId,
            String email
    );

    ConnectionResponse rejectConnection(
            Long connectionId,
            String email
    );

    void removeConnection(
            Long connectionId,
            String email
    );
}
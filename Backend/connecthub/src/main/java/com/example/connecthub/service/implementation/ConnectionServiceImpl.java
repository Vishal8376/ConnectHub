package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.response.ConnectionResponse;
import com.example.connecthub.dto.response.ConnectionUserResponse;
import com.example.connecthub.entity.Connection;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.ConnectionStatus;
import com.example.connecthub.exception.AccessDeniedException;
import com.example.connecthub.exception.ConnectionAlreadyExistsException;
import com.example.connecthub.exception.ConnectionNotFoundException;
import com.example.connecthub.exception.UserNotFoundException;
import com.example.connecthub.repository.ConnectionRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConnectionServiceImpl implements ConnectionService {

        private final ConnectionRepository connectionRepository;
        private final UserRepository userRepository;

        @Override
        public ConnectionResponse sendConnectionRequest(
                        String email,
                        Long receiverId) {

                User sender = getUser(email);

                User receiver = userRepository.findById(receiverId)
                                .orElseThrow(() -> new UserNotFoundException(
                                                "User not found"));

                // Prevent connecting with yourself
                if (sender.getId().equals(receiver.getId())) {
                        throw new ConnectionAlreadyExistsException(
                                        "You cannot connect with yourself");
                }

                // Check if a connection already exists in either direction
                Connection existingConnection = connectionRepository
                                .findBySenderIdAndReceiverId(
                                                sender.getId(),
                                                receiver.getId())
                                .orElseGet(() -> connectionRepository
                                                .findBySenderIdAndReceiverId(
                                                                receiver.getId(),
                                                                sender.getId())
                                                .orElse(null));

                if (existingConnection != null) {

                        // Pending request cannot be duplicated
                        if (existingConnection.getStatus() == ConnectionStatus.PENDING) {

                                throw new ConnectionAlreadyExistsException(
                                                "Connection request is already pending");
                        }

                        // Accepted connection cannot be requested again
                        if (existingConnection.getStatus() == ConnectionStatus.ACCEPTED) {

                                throw new ConnectionAlreadyExistsException(
                                                "Users are already connected");
                        }

                        // Rejected request → allow a new request
                        if (existingConnection.getStatus() == ConnectionStatus.REJECTED) {

                                connectionRepository.delete(existingConnection);
                        }
                }

                // Create a new connection request
                Connection connection = Connection.builder()
                                .sender(sender)
                                .receiver(receiver)
                                .status(ConnectionStatus.PENDING)
                                .build();

                Connection savedConnection = connectionRepository.save(connection);

                return mapToResponse(savedConnection);
        }

        @Override
        public List<ConnectionUserResponse> getReceivedRequests(
                        String email) {

                User user = getUser(email);

                return connectionRepository
                                .findByReceiverIdAndStatus(
                                                user.getId(),
                                                ConnectionStatus.PENDING)
                                .stream()
                                .map(connection -> mapToUserResponse(
                                                connection,
                                                connection.getSender()))
                                .toList();
        }

        @Override
        public List<ConnectionUserResponse> getSentRequests(
                        String email) {

                User user = getUser(email);

                return connectionRepository
                                .findBySenderIdAndStatus(
                                                user.getId(),
                                                ConnectionStatus.PENDING)
                                .stream()
                                .map(connection -> mapToUserResponse(
                                                connection,
                                                connection.getReceiver()))
                                .toList();
        }

        @Override
        public List<ConnectionUserResponse> getConnections(
                        String email) {

                User user = getUser(email);

                List<ConnectionUserResponse> connections = connectionRepository
                                .findBySenderIdAndStatus(
                                                user.getId(),
                                                ConnectionStatus.ACCEPTED)
                                .stream()
                                .map(connection -> mapToUserResponse(
                                                connection,
                                                connection.getReceiver()))
                                .toList();

                connections.addAll(
                                connectionRepository
                                                .findByReceiverIdAndStatus(
                                                                user.getId(),
                                                                ConnectionStatus.ACCEPTED)
                                                .stream()
                                                .map(connection -> mapToUserResponse(
                                                                connection,
                                                                connection.getSender()))
                                                .toList());

                return connections;
        }

        @Override
        public ConnectionResponse acceptConnection(
                        Long connectionId,
                        String email) {

                Connection connection = getConnection(connectionId);

                if (!connection.getReceiver().getEmail().equals(email)) {
                        throw new AccessDeniedException(
                                        "Only the receiver can accept this request");
                }

                if (connection.getStatus() != ConnectionStatus.PENDING) {
                        throw new ConnectionAlreadyExistsException(
                                        "Connection request is no longer pending");
                }

                connection.setStatus(ConnectionStatus.ACCEPTED);

                Connection updated = connectionRepository.save(connection);

                return mapToResponse(updated);
        }

        @Override
        public ConnectionResponse rejectConnection(
                        Long connectionId,
                        String email) {

                Connection connection = getConnection(connectionId);

                if (!connection.getReceiver().getEmail().equals(email)) {
                        throw new AccessDeniedException(
                                        "Only the receiver can reject this request");
                }

                if (connection.getStatus() != ConnectionStatus.PENDING) {
                        throw new ConnectionAlreadyExistsException(
                                        "Connection request is no longer pending");
                }

                connection.setStatus(ConnectionStatus.REJECTED);

                Connection updated = connectionRepository.save(connection);

                return mapToResponse(updated);
        }

        @Override
        public void removeConnection(
                        Long connectionId,
                        String email) {

                Connection connection = getConnection(connectionId);

                boolean isSender = connection.getSender().getEmail().equals(email);

                boolean isReceiver = connection.getReceiver().getEmail().equals(email);

                if (!isSender && !isReceiver) {
                        throw new AccessDeniedException(
                                        "You are not part of this connection");
                }

                if (connection.getStatus() != ConnectionStatus.ACCEPTED) {
                        throw new AccessDeniedException(
                                        "Only accepted connections can be removed");
                }

                connectionRepository.delete(connection);
        }

        private User getUser(String email) {

                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException("User not found"));
        }

        private Connection getConnection(Long id) {

                return connectionRepository.findById(id)
                                .orElseThrow(() -> new ConnectionNotFoundException(
                                                "Connection not found"));
        }

        private ConnectionResponse mapToResponse(
                        Connection connection) {

                return ConnectionResponse.builder()
                                .id(connection.getId())
                                .senderId(connection.getSender().getId())
                                .senderName(connection.getSender().getFullName())
                                .receiverId(connection.getReceiver().getId())
                                .receiverName(connection.getReceiver().getFullName())
                                .status(connection.getStatus())
                                .createdAt(connection.getCreatedAt())
                                .build();
        }

        private ConnectionUserResponse mapToUserResponse(
                        Connection connection,
                        User user) {

                return ConnectionUserResponse.builder()
                                .connectionId(connection.getId())
                                .userId(user.getId())
                                .fullName(user.getFullName())
                                .profilePicture(user.getProfilePicture())
                                .status(connection.getStatus())
                                .build();
        }
}
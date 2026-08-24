package com.example.connecthub.repository;

import com.example.connecthub.entity.Connection;
import com.example.connecthub.enums.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository
        extends JpaRepository<Connection, Long> {

    Optional<Connection> findBySenderIdAndReceiverId(
            Long senderId,
            Long receiverId);

    List<Connection> findByReceiverIdAndStatus(
            Long receiverId,
            ConnectionStatus status);

    List<Connection> findBySenderIdAndStatus(
            Long senderId,
            ConnectionStatus status);
}
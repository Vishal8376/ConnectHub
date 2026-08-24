package com.example.connecthub.repository;

import com.example.connecthub.entity.Conversation;
import com.example.connecthub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversationRepository
        extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByUserOneAndUserTwo(
            User userOne,
            User userTwo);

    Optional<Conversation> findByUserTwoAndUserOne(
            User userTwo,
            User userOne);
}
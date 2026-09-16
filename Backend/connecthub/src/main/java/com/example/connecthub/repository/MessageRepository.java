package com.example.connecthub.repository;

import com.example.connecthub.entity.Message;
import com.example.connecthub.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationOrderBySentAtAsc(Conversation conversation);

    long countByConversationIdAndReceiverIdAndIsReadFalse(Long conversationId, Long receiverId);

    List<Message> findByConversationIdAndReceiverIdAndIsReadFalse(Long conversationId, Long receiverId);

    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);
}
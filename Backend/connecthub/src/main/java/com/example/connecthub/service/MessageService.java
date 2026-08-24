package com.example.connecthub.service;

import com.example.connecthub.dto.response.MessageResponse;
import com.example.connecthub.entity.Conversation;
import com.example.connecthub.entity.User;

import java.util.List;

public interface MessageService {

        MessageResponse saveMessage(
                        Conversation conversation,
                        User sender,
                        User receiver,
                        String content);

        List<MessageResponse> getMessages(
                        Conversation conversation);

        List<MessageResponse> getMessagesByConversationId(
                        Long conversationId,
                        String email);

        Conversation findOrCreateConversation(
                        User userOne,
                        User userTwo);

        boolean areUsersConnected(
                        User userOne,
                        User userTwo);

        Conversation getConversation(
                        User userOne,
                        User userTwo);
}
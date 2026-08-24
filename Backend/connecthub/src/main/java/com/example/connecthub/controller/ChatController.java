package com.example.connecthub.controller;

import com.example.connecthub.dto.request.MessageRequest;
import com.example.connecthub.dto.response.MessageResponse;
import com.example.connecthub.entity.Conversation;
import com.example.connecthub.entity.User;
import com.example.connecthub.exception.ChatAccessDeniedException;
import com.example.connecthub.exception.UserNotFoundException;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.MessageService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat")
    public void sendMessage(
            @Valid MessageRequest request,
            StompHeaderAccessor accessor) {

        String senderEmail =
                (String) accessor.getSessionAttributes()
                        .get("userEmail");

        if (senderEmail == null) {
            throw new ChatAccessDeniedException(
                    "WebSocket user is not authenticated");
        }

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Sender not found"));

        User receiver = userRepository.findById(
                request.getReceiverId()
        ).orElseThrow(() ->
                new UserNotFoundException(
                        "Receiver not found"));

        if (!messageService.areUsersConnected(
                sender, receiver)) {

            throw new ChatAccessDeniedException(
                    "Users must be connected to start a chat");
        }

        Conversation conversation =
                messageService.findOrCreateConversation(
                        sender,
                        receiver);

        MessageResponse response =
                messageService.saveMessage(
                        conversation,
                        sender,
                        receiver,
                        request.getContent());

        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/messages",
                response);
    }
}
package com.example.connecthub.controller;

import com.example.connecthub.dto.response.MessageResponse;
import com.example.connecthub.dto.response.UnreadSummaryResponse;
import com.example.connecthub.entity.Conversation;
import com.example.connecthub.entity.User;
import com.example.connecthub.exception.ChatAccessDeniedException;
import com.example.connecthub.exception.UserNotFoundException;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @PathVariable Long conversationId,
            Principal principal) {

        return ResponseEntity.ok(
                messageService.getMessagesByConversationId(
                        conversationId,
                        principal.getName()
                )
        );
    }

    @GetMapping("/conversation/user/{userId}")
    public ResponseEntity<Long> getConversation(
            @PathVariable Long userId,
            Principal principal) {

        User currentUser = userRepository.findByEmail(
                principal.getName()
        ).orElseThrow(() ->
                new UserNotFoundException(
                        "User not found"));

        User otherUser = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"));

        // Only connected users can access a chat
        if (!messageService.areUsersConnected(
                currentUser,
                otherUser)) {

            throw new ChatAccessDeniedException(
                    "Users must be connected to chat");
        }

        Conversation conversation =
                messageService.getConversation(
                        currentUser,
                        otherUser);

        return ResponseEntity.ok(conversation.getId());
    }

    @GetMapping("/conversation/{conversationId}/unread-count")
    public ResponseEntity<Long> getUnreadCountForConversation(
            @PathVariable Long conversationId,
            Principal principal) {

        return ResponseEntity.ok(
                messageService.getUnreadCountForConversation(
                        conversationId,
                        principal.getName()
                )
        );
    }

    @PutMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable Long conversationId,
            Principal principal) {

        messageService.markConversationAsRead(conversationId, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-summary")
    public ResponseEntity<UnreadSummaryResponse> getUnreadSummary(
            Principal principal) {

        return ResponseEntity.ok(
                messageService.getUnreadSummary(principal.getName())
        );
    }
}
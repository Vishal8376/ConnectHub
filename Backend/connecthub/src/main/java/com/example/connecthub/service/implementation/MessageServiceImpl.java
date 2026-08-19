package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.response.MessageResponse;
import com.example.connecthub.entity.Conversation;
import com.example.connecthub.entity.Message;
import com.example.connecthub.entity.User;
import com.example.connecthub.repository.ConversationRepository;
import com.example.connecthub.repository.MessageRepository;
import com.example.connecthub.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;

    @Override
    public MessageResponse saveMessage(
            Conversation conversation,
            User sender,
            User receiver,
            String content) {

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .sentAt(LocalDateTime.now())
                .build();

        Message savedMessage = messageRepository.save(message);

        return mapToResponse(savedMessage);
    }

    @Override
    public List<MessageResponse> getMessages(Conversation conversation) {

        return messageRepository
                .findByConversationOrderBySentAtAsc(conversation)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Conversation findOrCreateConversation(
            User userOne,
            User userTwo) {

        return conversationRepository
                .findByUserOneAndUserTwo(userOne, userTwo)
                .or(() -> conversationRepository
                        .findByUserTwoAndUserOne(userOne, userTwo))
                .orElseGet(() ->
                        conversationRepository.save(
                                Conversation.builder()
                                        .userOne(userOne)
                                        .userTwo(userTwo)
                                        .build()
                        )
                );
    }

    private MessageResponse mapToResponse(Message message) {

        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .receiverId(message.getReceiver().getId())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .build();
    }
}
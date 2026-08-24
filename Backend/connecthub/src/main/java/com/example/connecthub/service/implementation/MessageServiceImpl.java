package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.response.MessageResponse;
import com.example.connecthub.entity.Conversation;
import com.example.connecthub.entity.Message;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.ConnectionStatus;
import com.example.connecthub.exception.ChatAccessDeniedException;
import com.example.connecthub.exception.ConversationNotFoundException;
import com.example.connecthub.repository.ConnectionRepository;
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
        private final ConnectionRepository connectionRepository;

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
        public List<MessageResponse> getMessages(
                        Conversation conversation) {

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

                User firstUser;
                User secondUser;

                if (userOne.getId() < userTwo.getId()) {
                        firstUser = userOne;
                        secondUser = userTwo;
                } else {
                        firstUser = userTwo;
                        secondUser = userOne;
                }

                return conversationRepository
                                .findByUserOneAndUserTwo(
                                                firstUser,
                                                secondUser)
                                .orElseGet(() -> conversationRepository.save(
                                                Conversation.builder()
                                                                .userOne(firstUser)
                                                                .userTwo(secondUser)
                                                                .build()));
        }

        @Override
        public boolean areUsersConnected(
                        User userOne,
                        User userTwo) {

                return connectionRepository
                                .findBySenderIdAndReceiverId(
                                                userOne.getId(),
                                                userTwo.getId())
                                .map(connection -> connection.getStatus() == ConnectionStatus.ACCEPTED)
                                .orElseGet(() -> connectionRepository
                                                .findBySenderIdAndReceiverId(
                                                                userTwo.getId(),
                                                                userOne.getId())
                                                .map(connection -> connection.getStatus() == ConnectionStatus.ACCEPTED)
                                                .orElse(false));
        }

        private MessageResponse mapToResponse(
                        Message message) {

                return MessageResponse.builder()
                                .id(message.getId())
                                .conversationId(
                                                message.getConversation().getId())
                                .senderId(
                                                message.getSender().getId())
                                .receiverId(
                                                message.getReceiver().getId())
                                .content(message.getContent())
                                .sentAt(message.getSentAt())
                                .build();
        }

        @Override
        public List<MessageResponse> getMessagesByConversationId(
                        Long conversationId,
                        String email) {

                Conversation conversation = conversationRepository.findById(conversationId)
                                .orElseThrow(() -> new ConversationNotFoundException(
                                                "Conversation not found"));

                boolean isParticipant = conversation.getUserOne()
                                .getEmail()
                                .equals(email)
                                ||
                                conversation.getUserTwo()
                                                .getEmail()
                                                .equals(email);

                if (!isParticipant) {
                        throw new ChatAccessDeniedException(
                                        "You are not a participant of this conversation");
                }

                return getMessages(conversation);
        }

        @Override
        public Conversation getConversation(
                        User userOne,
                        User userTwo) {

                User firstUser;
                User secondUser;

                if (userOne.getId() < userTwo.getId()) {
                        firstUser = userOne;
                        secondUser = userTwo;
                } else {
                        firstUser = userTwo;
                        secondUser = userOne;
                }

                return conversationRepository
                                .findByUserOneAndUserTwo(
                                                firstUser,
                                                secondUser)
                                .orElseThrow(() -> new ConversationNotFoundException(
                                                "Conversation not found"));
        }
}
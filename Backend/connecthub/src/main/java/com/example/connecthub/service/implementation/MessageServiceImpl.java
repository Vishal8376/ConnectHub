package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.response.ConversationUnreadDTO;
import com.example.connecthub.dto.response.MessageResponse;
import com.example.connecthub.dto.response.UnreadSummaryResponse;
import com.example.connecthub.entity.Conversation;
import com.example.connecthub.entity.Message;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.ConnectionStatus;
import com.example.connecthub.exception.ChatAccessDeniedException;
import com.example.connecthub.exception.ConversationNotFoundException;
import com.example.connecthub.exception.UserNotFoundException;
import com.example.connecthub.repository.ConnectionRepository;
import com.example.connecthub.repository.ConversationRepository;
import com.example.connecthub.repository.MessageRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

        private final MessageRepository messageRepository;
        private final ConversationRepository conversationRepository;
        private final ConnectionRepository connectionRepository;
        private final UserRepository userRepository;

        @Override
        @Transactional
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
                                .isRead(false)
                                .build();

                Message savedMessage = messageRepository.save(message);

                return mapToResponse(savedMessage);
        }

        @Override
        @Transactional(readOnly = true)
        public List<MessageResponse> getMessages(
                        Conversation conversation) {

                return messageRepository
                                .findByConversationOrderBySentAtAsc(conversation)
                                .stream()
                                .map(this::mapToResponse)
                                .toList();
        }

        @Override
        @Transactional
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
        @Transactional(readOnly = true)
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
                                .isRead(message.getIsRead() != null ? message.getIsRead() : false)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
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
        @Transactional(readOnly = true)
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

        @Override
        @Transactional(readOnly = true)
        public long getUnreadCountForConversation(Long conversationId, String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException("User not found"));

                return messageRepository.countByConversationIdAndReceiverIdAndIsReadFalse(conversationId, user.getId());
        }

        @Override
        @Transactional
        public void markConversationAsRead(Long conversationId, String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException("User not found"));

                Conversation conversation = conversationRepository.findById(conversationId)
                                .orElseThrow(() -> new ConversationNotFoundException("Conversation not found"));

                boolean isParticipant = conversation.getUserOne().getId().equals(user.getId())
                                || conversation.getUserTwo().getId().equals(user.getId());

                if (!isParticipant) {
                        throw new ChatAccessDeniedException("You are not a participant of this conversation");
                }

                List<Message> unreadMessages = messageRepository.findByConversationIdAndReceiverIdAndIsReadFalse(conversationId, user.getId());
                for (Message msg : unreadMessages) {
                        msg.setIsRead(true);
                }
                messageRepository.saveAll(unreadMessages);
        }

        @Override
        @Transactional(readOnly = true)
        public UnreadSummaryResponse getUnreadSummary(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new UserNotFoundException("User not found"));

                List<Message> unreadMessages = messageRepository.findByReceiverIdAndIsReadFalse(user.getId());

                long totalUnread = unreadMessages.size();

                Map<Long, ConversationUnreadDTO> conversationMap = new HashMap<>();

                for (Message msg : unreadMessages) {
                        Long convId = msg.getConversation().getId();
                        Long senderId = msg.getSender().getId();

                        if (!conversationMap.containsKey(convId)) {
                                conversationMap.put(convId, ConversationUnreadDTO.builder()
                                                .conversationId(convId)
                                                .userId(senderId)
                                                .unreadCount(1L)
                                                .build());
                        } else {
                                ConversationUnreadDTO dto = conversationMap.get(convId);
                                dto.setUnreadCount(dto.getUnreadCount() + 1);
                        }
                }

                List<ConversationUnreadDTO> conversationList = new ArrayList<>(conversationMap.values());
                long unreadConversationCount = conversationList.size();

                return UnreadSummaryResponse.builder()
                                .totalUnreadMessages(totalUnread)
                                .unreadConversationCount(unreadConversationCount)
                                .conversations(conversationList)
                                .build();
        }
}
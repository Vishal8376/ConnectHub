package com.example.connecthub;

import com.example.connecthub.dto.response.MessageResponse;
import com.example.connecthub.dto.response.UnreadSummaryResponse;
import com.example.connecthub.entity.Conversation;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.ConnectionStatus;
import com.example.connecthub.enums.Role;
import com.example.connecthub.entity.Connection;
import com.example.connecthub.repository.ConnectionRepository;
import com.example.connecthub.repository.ConversationRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.MessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class UnreadMessageTest {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConnectionRepository connectionRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    private User user1;
    private User user2;
    private Conversation conversation;

    @BeforeEach
    public void setUp() {
        String uid = UUID.randomUUID().toString().substring(0, 5);

        user1 = User.builder()
                .fullName("UserOne " + uid)
                .email("user1_" + uid + "@example.com")
                .password("password123")
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();
        userRepository.save(user1);

        user2 = User.builder()
                .fullName("UserTwo " + uid)
                .email("user2_" + uid + "@example.com")
                .password("password123")
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();
        userRepository.save(user2);

        Connection conn = Connection.builder()
                .sender(user1)
                .receiver(user2)
                .status(ConnectionStatus.ACCEPTED)
                .build();
        connectionRepository.save(conn);

        conversation = messageService.findOrCreateConversation(user1, user2);
    }

    @Test
    public void testUnreadMessageCountsAndReadMarking() {
        // user1 sends 2 messages to user2
        messageService.saveMessage(conversation, user1, user2, "Msg 1 from User1");
        messageService.saveMessage(conversation, user1, user2, "Msg 2 from User1");

        // user2's unread summary should have 1 unread conversation, total 2 unread messages
        UnreadSummaryResponse summaryUser2 = messageService.getUnreadSummary(user2.getEmail());
        assertEquals(2, summaryUser2.getTotalUnreadMessages());
        assertEquals(1, summaryUser2.getUnreadConversationCount());

        // user1's unread summary should be 0 (sent messages don't count for sender)
        UnreadSummaryResponse summaryUser1 = messageService.getUnreadSummary(user1.getEmail());
        assertEquals(0, summaryUser1.getTotalUnreadMessages());
        assertEquals(0, summaryUser1.getUnreadConversationCount());

        // user2 marks conversation as read
        messageService.markConversationAsRead(conversation.getId(), user2.getEmail());

        UnreadSummaryResponse summaryUser2After = messageService.getUnreadSummary(user2.getEmail());
        assertEquals(0, summaryUser2After.getTotalUnreadMessages());
        assertEquals(0, summaryUser2After.getUnreadConversationCount());
    }
}

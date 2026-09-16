package com.example.connecthub;

import com.example.connecthub.dto.response.CommunityMessageResponse;
import com.example.connecthub.entity.Community;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.CommunityVisibility;
import com.example.connecthub.enums.Role;
import com.example.connecthub.exception.CommunityAccessDeniedException;
import com.example.connecthub.repository.CommunityRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.CommunityMessageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class CommunityChatTest {

    @Autowired
    private CommunityMessageService communityMessageService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityRepository communityRepository;

    private User creator;
    private User nonMember;
    private Community community;

    @BeforeEach
    public void setUp() {
        String uid = UUID.randomUUID().toString().substring(0, 5);

        creator = User.builder()
                .fullName("ChatCreator " + uid)
                .email("chat_creator_" + uid + "@example.com")
                .password("password123")
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();
        userRepository.save(creator);

        nonMember = User.builder()
                .fullName("NonMember " + uid)
                .email("nonmember_" + uid + "@example.com")
                .password("password123")
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();
        userRepository.save(nonMember);

        community = Community.builder()
                .name("Chat Hub " + uid)
                .description("Chat Community")
                .visibility(CommunityVisibility.PRIVATE)
                .creator(creator)
                .build();
        community.getUsers().add(creator);
        communityRepository.save(community);
    }

    @Test
    public void testMemberCanSendAndReadMessages() {
        CommunityMessageResponse msg = communityMessageService.saveAndMapCommunityMessage(
                community.getId(), creator.getEmail(), "Hello Community!");
        assertNotNull(msg);
        assertEquals("Hello Community!", msg.getContent());

        List<CommunityMessageResponse> history = communityMessageService.getCommunityMessageHistory(
                community.getId(), creator.getEmail());
        assertEquals(1, history.size());
    }

    @Test
    public void testNonMemberCannotSendOrReadMessages() {
        assertThrows(CommunityAccessDeniedException.class, () -> {
            communityMessageService.getCommunityMessageHistory(community.getId(), nonMember.getEmail());
        });

        assertThrows(CommunityAccessDeniedException.class, () -> {
            communityMessageService.saveAndMapCommunityMessage(community.getId(), nonMember.getEmail(), "Forbidden");
        });
    }
}

package com.example.connecthub;

import com.example.connecthub.dto.response.CommunityJoinRequestResponse;
import com.example.connecthub.dto.response.CommunityResponse;
import com.example.connecthub.entity.Community;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.CommunityVisibility;
import com.example.connecthub.enums.JoinRequestStatus;
import com.example.connecthub.enums.Role;
import com.example.connecthub.exception.CommunityAccessDeniedException;
import com.example.connecthub.repository.CommunityRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.CommunityService;
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
public class CommunityJoinRequestTest {

    @Autowired
    private CommunityService communityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityRepository communityRepository;

    private User creator;
    private User applicant;
    private Community privateCommunity;
    private Community publicCommunity;

    @BeforeEach
    public void setUp() {
        String uid = UUID.randomUUID().toString().substring(0, 5);

        creator = User.builder()
                .fullName("Creator " + uid)
                .email("creator_" + uid + "@example.com")
                .password("password123")
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();
        userRepository.save(creator);

        applicant = User.builder()
                .fullName("Applicant " + uid)
                .email("applicant_" + uid + "@example.com")
                .password("password123")
                .role(Role.ROLE_USER)
                .enabled(true)
                .build();
        userRepository.save(applicant);

        privateCommunity = Community.builder()
                .name("Private Hub " + uid)
                .description("Private description")
                .visibility(CommunityVisibility.PRIVATE)
                .creator(creator)
                .build();
        communityRepository.save(privateCommunity);

        publicCommunity = Community.builder()
                .name("Public Hub " + uid)
                .description("Public description")
                .visibility(CommunityVisibility.PUBLIC)
                .creator(creator)
                .build();
        communityRepository.save(publicCommunity);
    }

    @Test
    public void testPublicJoinDirectly() {
        communityService.joinCommunity(publicCommunity.getId(), applicant.getEmail());
        CommunityResponse resp = communityService.getCommunityById(publicCommunity.getId());
        assertNotNull(resp);
    }

    @Test
    public void testPrivateDirectJoinFails() {
        assertThrows(CommunityAccessDeniedException.class, () -> {
            communityService.joinCommunity(privateCommunity.getId(), applicant.getEmail());
        });
    }

    @Test
    public void testJoinRequestFlow() {
        // Applicant requests to join
        CommunityJoinRequestResponse reqResponse = communityService.createJoinRequest(privateCommunity.getId(), applicant.getEmail());
        assertEquals(JoinRequestStatus.PENDING, reqResponse.getStatus());

        // Duplicate pending request throws exception
        assertThrows(CommunityAccessDeniedException.class, () -> {
            communityService.createJoinRequest(privateCommunity.getId(), applicant.getEmail());
        });

        // Non-creator cannot view requests
        assertThrows(CommunityAccessDeniedException.class, () -> {
            communityService.getJoinRequestsForCommunity(privateCommunity.getId(), applicant.getEmail());
        });

        // Creator views requests
        List<CommunityJoinRequestResponse> requests = communityService.getJoinRequestsForCommunity(privateCommunity.getId(), creator.getEmail());
        assertEquals(1, requests.size());

        // Creator accepts request
        CommunityJoinRequestResponse accepted = communityService.acceptJoinRequest(reqResponse.getRequestId(), creator.getEmail());
        assertEquals(JoinRequestStatus.ACCEPTED, accepted.getStatus());

        // Check applicant is now a member
        Community updatedComm = communityRepository.findById(privateCommunity.getId()).orElseThrow();
        assertTrue(updatedComm.getUsers().stream().anyMatch(u -> u.getId().equals(applicant.getId())));
    }

    @Test
    public void testRejectJoinRequest() {
        CommunityJoinRequestResponse reqResponse = communityService.createJoinRequest(privateCommunity.getId(), applicant.getEmail());
        assertEquals(JoinRequestStatus.PENDING, reqResponse.getStatus());

        CommunityJoinRequestResponse rejected = communityService.rejectJoinRequest(reqResponse.getRequestId(), creator.getEmail());
        assertEquals(JoinRequestStatus.REJECTED, rejected.getStatus());

        // Applicant can request again after rejection
        CommunityJoinRequestResponse newReq = communityService.createJoinRequest(privateCommunity.getId(), applicant.getEmail());
        assertEquals(JoinRequestStatus.PENDING, newReq.getStatus());
    }
}

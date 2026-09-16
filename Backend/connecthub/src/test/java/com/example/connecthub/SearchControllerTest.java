package com.example.connecthub;

import com.example.connecthub.dto.response.SearchAutocompleteResponse;
import com.example.connecthub.entity.Community;
import com.example.connecthub.entity.User;
import com.example.connecthub.enums.CommunityVisibility;
import com.example.connecthub.enums.Role;
import com.example.connecthub.repository.CommunityRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.SearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class SearchControllerTest {

    @Autowired
    private SearchService searchService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityRepository communityRepository;

    private String prefix;

    @BeforeEach
    public void setUp() {
        prefix = "Zztest" + UUID.randomUUID().toString().substring(0, 4);

        for (int i = 1; i <= 6; i++) {
            User user = User.builder()
                    .fullName(prefix + "User " + i)
                    .email(prefix.toLowerCase() + i + "@example.com")
                    .password("password123")
                    .profession("Engineer")
                    .college("Tech College")
                    .role(Role.ROLE_USER)
                    .enabled(true)
                    .build();
            userRepository.save(user);
        }

        User creator = userRepository.findAll().get(0);
        for (int i = 1; i <= 6; i++) {
            Community community = Community.builder()
                    .name(prefix + "Comm " + i)
                    .description("AI Community " + i)
                    .visibility(CommunityVisibility.PUBLIC)
                    .creator(creator)
                    .build();
            communityRepository.save(community);
        }
    }

    @Test
    public void testAutocompletePrefix() {
        SearchAutocompleteResponse response = searchService.autocomplete(prefix);
        assertNotNull(response);
        assertNotNull(response.getUsers());
        assertNotNull(response.getCommunities());
        // Max 5 users and 5 communities returned by findTop5
        assertEquals(5, response.getUsers().size());
        assertEquals(5, response.getCommunities().size());

        for (var u : response.getUsers()) {
            assertTrue(u.getFullName().startsWith(prefix));
        }
        for (var c : response.getCommunities()) {
            assertTrue(c.getName().startsWith(prefix));
        }
    }

    @Test
    public void testAutocompleteCaseInsensitivity() {
        SearchAutocompleteResponse lower = searchService.autocomplete(prefix.toLowerCase());
        SearchAutocompleteResponse upper = searchService.autocomplete(prefix.toUpperCase());

        assertEquals(5, lower.getUsers().size());
        assertEquals(5, upper.getUsers().size());
        assertEquals(5, lower.getCommunities().size());
        assertEquals(5, upper.getCommunities().size());
    }

    @Test
    public void testEmptyAndWhitespaceQuery() {
        SearchAutocompleteResponse nullQuery = searchService.autocomplete(null);
        assertEquals(0, nullQuery.getUsers().size());
        assertEquals(0, nullQuery.getCommunities().size());

        SearchAutocompleteResponse emptyQuery = searchService.autocomplete("   ");
        assertEquals(0, emptyQuery.getUsers().size());
        assertEquals(0, emptyQuery.getCommunities().size());
    }
}

package com.example.connecthub.repository;

import com.example.connecthub.entity.CommunityMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityMessageRepository extends JpaRepository<CommunityMessage, Long> {
    List<CommunityMessage> findByCommunityIdOrderBySentAtAsc(Long communityId);
}

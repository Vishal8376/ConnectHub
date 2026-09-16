package com.example.connecthub.repository;

import com.example.connecthub.entity.CommunityJoinRequest;
import com.example.connecthub.enums.JoinRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityJoinRequestRepository extends JpaRepository<CommunityJoinRequest, Long> {

    boolean existsByCommunityIdAndUserIdAndStatus(Long communityId, Long userId, JoinRequestStatus status);

    Optional<CommunityJoinRequest> findByCommunityIdAndUserIdAndStatus(Long communityId, Long userId, JoinRequestStatus status);

    Optional<CommunityJoinRequest> findTopByCommunityIdAndUserIdOrderByCreatedAtDesc(Long communityId, Long userId);

    List<CommunityJoinRequest> findByCommunityIdAndStatusOrderByCreatedAtDesc(Long communityId, JoinRequestStatus status);

    List<CommunityJoinRequest> findByCommunityIdOrderByCreatedAtDesc(Long communityId);
}

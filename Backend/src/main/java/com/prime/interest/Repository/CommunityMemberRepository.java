package com.prime.interest.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prime.interest.Entity.Community;
import com.prime.interest.Entity.CommunityMember;
import com.prime.interest.Entity.User;

public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {

    boolean existsByUserAndCommunity(User user, Community community);

    List<CommunityMember> findByUser(User user);

    List<CommunityMember> findByCommunity(Community community);

    List<CommunityMember> findByUserId(Long userId);

    @Query("""
                SELECT cm
                FROM CommunityMember cm
                WHERE cm.user.id = :id
                AND cm.community.Community_id = :Community_id
            """)
    Optional<CommunityMember> findMembership(
            @Param("id") Long userId,
            @Param("Community_id") Long communityId);

}

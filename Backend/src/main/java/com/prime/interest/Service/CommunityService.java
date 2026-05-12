package com.prime.interest.Service;

import com.prime.interest.Entity.Community;
import com.prime.interest.Entity.CommunityMember;
import com.prime.interest.Entity.User;
import com.prime.interest.Repository.CommunityMemberRepository;
import com.prime.interest.Repository.CommunityRepository;
import com.prime.interest.Repository.UserRepository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CommunityService {

    @Autowired
    private CommunityRepository communityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityMemberRepository communityMemberRepository;

    public void addCommunity(Community community) {
        if (community.getName() == null) {
            throw new IllegalArgumentException("Community name cannot be null");
        }
        communityRepository.save(community);
    }

    public void joinCommunity(Long communityId, Long userId) {

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not Found"));

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not Found"));

        boolean exists = communityMemberRepository
                .existsByUserAndCommunity(user, community);

        if (exists) {
            throw new RuntimeException("Already joined");
        }

        CommunityMember member = new CommunityMember();

        member.setUser(user);
        member.setCommunity(community);

        communityMemberRepository.save(member);
    }

    public Community getCommunityById(Long communityId) {
        return communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not Found"));
    }

    public List<Community> getJoinedCommunities(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow();

        List<CommunityMember> memberships = communityMemberRepository.findByUser(user);

        List<Community> communities = new ArrayList<>();

        for (CommunityMember member : memberships) {
            communities.add(member.getCommunity());
        }

        return communities;
    }

    public List<CommunityMember> getCommunityMembers(Long communityId) {

        Community community = communityRepository.findById(communityId)
                .orElseThrow();

        return communityMemberRepository.findByCommunity(community);
    }

    public void leaveCommunity(Long userId,
            Long communityId) {

        CommunityMember membership = communityMemberRepository
                .findMembership(
                        userId,
                        communityId)
                .orElseThrow(() -> new RuntimeException(
                        "Membership not found"));

        communityMemberRepository.delete(membership);
    }

    public void deleteCommunity(Long communityId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow();

        communityRepository.delete(community);
    }

    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }
}

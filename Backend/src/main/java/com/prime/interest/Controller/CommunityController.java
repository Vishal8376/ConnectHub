package com.prime.interest.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prime.interest.Entity.Community;
import com.prime.interest.Entity.CommunityMember;
import com.prime.interest.Service.CommunityService;

@RestController
@RequestMapping("/api/communities")
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    @PostMapping("/add")
    public String addCommunity(@RequestBody Community community) {
        communityService.addCommunity(community);
        return "Community added successfully";
    }

    @PostMapping("/join")
    public String joinCommunity(
            @RequestBody CommunityMember communityMember) {

        communityService.joinCommunity(
                communityMember.getCommunity().getCommunity_id(),
                communityMember.getUser().getId());

        return "Joined community successfully";
    }

    @GetMapping("/{communityId}")
    public Community getCommunityById(
            @PathVariable Long communityId) {

        return communityService
                .getCommunityById(communityId);
    }

    @GetMapping("/user/{userId}")
    public List<Community> getJoinedCommunities(
            @PathVariable Long userId) {

        return communityService
                .getJoinedCommunities(userId);
    }

    @GetMapping("/{communityId}/members")
    public List<CommunityMember> getCommunityMembers(
            @PathVariable Long communityId) {

        return communityService
                .getCommunityMembers(communityId);
    }

    @DeleteMapping("/leave")
    public String leaveCommunity(
            @RequestBody CommunityMember communityMember) {

        communityService.leaveCommunity(
                communityMember.getCommunity().getCommunity_id(),
                communityMember.getUser().getId());

        return "Left community successfully";
    }

    @DeleteMapping("/delete/{communityId}")
    public String deleteCommunity(
            @PathVariable Long communityId) {

        communityService.deleteCommunity(communityId);

        return "Community deleted successfully";
    }

    @GetMapping("/all")
    public List<Community> getAllCommunities() {
        return communityService.getAllCommunities();
    }
}

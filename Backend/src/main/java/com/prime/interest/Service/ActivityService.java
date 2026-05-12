package com.prime.interest.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.prime.interest.DTO.ActivityFeedDTO;
import com.prime.interest.Entity.Activity;
import com.prime.interest.Entity.Community;
import com.prime.interest.Entity.CommunityMember;
import com.prime.interest.Entity.User;
import com.prime.interest.Repository.ActivityRepository;
import com.prime.interest.Repository.CommunityMemberRepository;
import com.prime.interest.Repository.UserRepository;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommunityMemberRepository communityMemberRepository;

    public void createActivity(Activity activity) {
        activityRepository.save(activity);
    }

    public List<ActivityFeedDTO> getUserFeed(Long userId) {

        List<CommunityMember> memberships = communityMemberRepository.findByUserId(userId);

        List<Long> communityIds = memberships.stream()
                .map(cm -> cm.getCommunity().getCommunity_id())
                .toList();

        List<Activity> activities = activityRepository
                .findActivitiesByCommunityIds(communityIds);

        return activities.stream().map(activity -> {

            ActivityFeedDTO dto = new ActivityFeedDTO();

            dto.setActivityId(activity.getId());
            dto.setTitle(activity.getTitle());
            dto.setDescription(activity.getDescription());
            dto.setType(activity.getType());

            dto.setCommunityName(
                    activity.getCommunity().getName());

            dto.setPostedBy(
                    activity.getUser().getUsername());

            return dto;

        }).toList();
    }
}

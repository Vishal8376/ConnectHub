package com.prime.interest.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prime.interest.DTO.ActivityFeedDTO;
import com.prime.interest.Entity.Activity;
import com.prime.interest.Service.ActivityService;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @PostMapping("/create")
    public String createActivity(@RequestBody Activity activity) {
        {
            activityService.createActivity(activity);
            return "Activity created successfully!";
        }
    }

    @GetMapping("/feed/{userId}")
    public List<ActivityFeedDTO> getFeed(
            @PathVariable Long userId) {

        return activityService.getUserFeed(userId);
    }
}

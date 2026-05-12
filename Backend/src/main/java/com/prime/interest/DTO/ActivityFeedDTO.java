package com.prime.interest.DTO;

import lombok.Data;

@Data
public class ActivityFeedDTO {

    private Long activityId;

    private String title;

    private String description;

    private String type;

    private String communityName;

    private String postedBy;
}
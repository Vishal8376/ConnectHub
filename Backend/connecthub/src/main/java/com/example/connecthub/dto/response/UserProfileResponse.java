package com.example.connecthub.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {

    private Long id;

    private String fullName;

    private String email;

    private String bio;

    private String college;

    private String profession;

    private String location;

    private String profilePicture;
}
package com.example.connecthub.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateProfileRequest {

    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;

    private String college;

    private String profession;

    private String location;

    private String profilePicture;

    private List<Long> interestIds;
}
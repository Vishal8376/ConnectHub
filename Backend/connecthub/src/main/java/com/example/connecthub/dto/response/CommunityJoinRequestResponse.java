package com.example.connecthub.dto.response;

import com.example.connecthub.enums.JoinRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityJoinRequestResponse {
    private Long requestId;
    private Long communityId;
    private String communityName;
    private Long userId;
    private String fullName;
    private String profilePicture;
    private String profession;
    private JoinRequestStatus status;
    private LocalDateTime createdAt;
}

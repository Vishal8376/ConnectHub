package com.example.connecthub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityMessageResponse {
    private Long id;
    private Long communityId;
    private Long senderId;
    private String senderName;
    private String senderProfilePicture;
    private String content;
    private LocalDateTime sentAt;
}

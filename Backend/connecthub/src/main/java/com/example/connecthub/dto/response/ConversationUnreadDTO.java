package com.example.connecthub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationUnreadDTO {
    private Long conversationId;
    private Long userId;
    private Long unreadCount;
}

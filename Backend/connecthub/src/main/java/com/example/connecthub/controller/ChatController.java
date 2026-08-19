package com.example.connecthub.controller;

import com.example.connecthub.dto.request.MessageRequest;
import com.example.connecthub.dto.response.MessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    @MessageMapping("/chat")
    @SendToUser("/queue/messages")
    public MessageResponse sendMessage(MessageRequest request) {
        return null;
    }
}
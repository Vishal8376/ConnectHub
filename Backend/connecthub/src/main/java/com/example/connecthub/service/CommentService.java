package com.example.connecthub.service;

import com.example.connecthub.dto.request.CreateCommentRequest;
import com.example.connecthub.dto.request.UpdateCommentRequest;
import com.example.connecthub.dto.response.CommentResponse;

import java.util.List;


public interface CommentService {

    CommentResponse createComment(
            Long postId,
            String email,
            CreateCommentRequest request
    );

    List<CommentResponse> getCommentsByPost(Long postId);

    CommentResponse updateComment(
            Long id,
            String email,
            UpdateCommentRequest request
    );

    void deleteComment(
            Long id,
            String email
    );
}
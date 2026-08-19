package com.example.connecthub.service;

import com.example.connecthub.dto.request.CreatePostRequest;
import com.example.connecthub.dto.request.UpdatePostRequest;
import com.example.connecthub.dto.response.PostResponse;

import java.util.List;


public interface PostService {

    PostResponse createPost(
            String email,
            CreatePostRequest request
    );

    List<PostResponse> getAllPosts();

    List<PostResponse> getPostsByCommunity(Long communityId);

    PostResponse getPostById(Long id);

    PostResponse updatePost(
            Long id,
            String email,
            UpdatePostRequest request
    );

    void deletePost(
            Long id,
            String email
    );
}
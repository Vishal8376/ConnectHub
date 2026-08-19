package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.request.CreatePostRequest;
import com.example.connecthub.dto.request.UpdatePostRequest;
import com.example.connecthub.dto.response.PostResponse;
import com.example.connecthub.entity.Community;
import com.example.connecthub.entity.Post;
import com.example.connecthub.entity.User;
import com.example.connecthub.exception.CommunityNotFoundException;
import com.example.connecthub.exception.PostNotFoundException;
import com.example.connecthub.repository.CommunityRepository;
import com.example.connecthub.repository.PostRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;

    @Override
    public PostResponse createPost(
            String email,
            CreatePostRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(() ->
                        new CommunityNotFoundException("Community not found"));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .user(user)
                .community(community)
                .build();

        Post savedPost = postRepository.save(post);

        return mapToResponse(savedPost);
    }

    @Override
    public List<PostResponse> getAllPosts() {

        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<PostResponse> getPostsByCommunity(Long communityId) {

        if (!communityRepository.existsById(communityId)) {
            throw new CommunityNotFoundException("Community not found");
        }

        return postRepository
                .findByCommunityIdOrderByCreatedAtDesc(communityId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public PostResponse getPostById(Long id) {

        Post post = postRepository.findById(id)
                .orElseThrow(() ->
                        new PostNotFoundException("Post not found"));

        return mapToResponse(post);
    }

    @Override
    public PostResponse updatePost(
            Long id,
            String email,
            UpdatePostRequest request) {

        Post post = postRepository.findById(id)
                .orElseThrow(() ->
                        new PostNotFoundException("Post not found"));

        if (!post.getUser().getEmail().equals(email)) {
            throw new RuntimeException(
                    "Only the post author can update this post");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());

        Post updatedPost = postRepository.save(post);

        return mapToResponse(updatedPost);
    }

    @Override
    public void deletePost(
            Long id,
            String email) {

        Post post = postRepository.findById(id)
                .orElseThrow(() ->
                        new PostNotFoundException("Post not found"));

        if (!post.getUser().getEmail().equals(email)) {
            throw new RuntimeException(
                    "Only the post author can delete this post");
        }

        postRepository.delete(post);
    }

    private PostResponse mapToResponse(Post post) {

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .author(post.getUser().getFullName())
                .community(post.getCommunity().getName())
                .createdAt(post.getCreatedAt())
                .build();
    }
}
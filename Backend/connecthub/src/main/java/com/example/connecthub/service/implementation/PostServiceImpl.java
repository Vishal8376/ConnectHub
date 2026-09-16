package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.request.CreatePostRequest;
import com.example.connecthub.dto.request.UpdatePostRequest;
import com.example.connecthub.dto.response.PostResponse;
import com.example.connecthub.entity.Community;
import com.example.connecthub.entity.Post;
import com.example.connecthub.entity.PostLike;
import com.example.connecthub.entity.User;
import com.example.connecthub.exception.AccessDeniedException;
import com.example.connecthub.exception.CommunityAccessDeniedException;
import com.example.connecthub.exception.CommunityNotFoundException;
import com.example.connecthub.exception.PostNotFoundException;
import com.example.connecthub.exception.UserNotFoundException;
import com.example.connecthub.repository.CommunityRepository;
import com.example.connecthub.repository.PostLikeRepository;
import com.example.connecthub.repository.PostRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final PostLikeRepository postLikeRepository;

    @Override
    @Transactional
    public PostResponse createPost(
            String email,
            CreatePostRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        Community community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(() ->
                        new CommunityNotFoundException("Community not found"));

        boolean isCreator = community.getCreator() != null && community.getCreator().getId().equals(user.getId());
        boolean isMember = isCreator || (community.getUsers() != null && community.getUsers().stream().anyMatch(u -> u.getId().equals(user.getId())));

        if (!isMember) {
            throw new CommunityAccessDeniedException(
                    "You must be a member of this community to create a post.");
        }

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
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {

        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public PostResponse getPostById(Long id) {

        Post post = postRepository.findById(id)
                .orElseThrow(() ->
                        new PostNotFoundException("Post not found"));

        return mapToResponse(post);
    }

    @Override
    @Transactional
    public PostResponse updatePost(
            Long id,
            String email,
            UpdatePostRequest request) {

        Post post = postRepository.findById(id)
                .orElseThrow(() ->
                        new PostNotFoundException("Post not found"));

        if (!post.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException(
                    "Only the post author can update this post");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());

        Post updatedPost = postRepository.save(post);

        return mapToResponse(updatedPost);
    }

    @Override
    @Transactional
    public void deletePost(
            Long id,
            String email) {

        Post post = postRepository.findById(id)
                .orElseThrow(() ->
                        new PostNotFoundException("Post not found"));

        if (!post.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException(
                    "Only the post author can delete this post");
        }

        postRepository.delete(post);
    }

    @Override
    @Transactional
    public PostResponse likePost(
            Long postId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new PostNotFoundException("Post not found"));

        if (!postLikeRepository.existsByUserIdAndPostId(user.getId(), post.getId())) {
            PostLike postLike = PostLike.builder()
                    .user(user)
                    .post(post)
                    .build();
            try {
                postLikeRepository.save(postLike);
            } catch (DataIntegrityViolationException e) {
                // Ignore duplicate like safely (e.g. concurrent requests)
            }
        }

        return mapToResponse(post);
    }

    @Override
    @Transactional
    public PostResponse unlikePost(
            Long postId,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new PostNotFoundException("Post not found"));

        postLikeRepository.deleteByUserIdAndPostId(user.getId(), post.getId());

        return mapToResponse(post);
    }

    private String getCurrentUserEmailSafely() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                return auth.getName();
            }
        } catch (Exception e) {
            // Fail safely
        }
        return null;
    }

    private PostResponse mapToResponse(Post post) {

        long likeCount = postLikeRepository.countByPostId(post.getId());
        boolean likedByCurrentUser = false;

        String currentEmail = getCurrentUserEmailSafely();
        if (currentEmail != null) {
            User currentUser = userRepository.findByEmail(currentEmail).orElse(null);
            if (currentUser != null) {
                likedByCurrentUser = postLikeRepository.existsByUserIdAndPostId(currentUser.getId(), post.getId());
            }
        }

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .author(post.getUser().getFullName())
                .community(post.getCommunity().getName())
                .communityId(post.getCommunity().getId())
                .createdAt(post.getCreatedAt())
                .likeCount(likeCount)
                .likedByCurrentUser(likedByCurrentUser)
                .build();
    }
}
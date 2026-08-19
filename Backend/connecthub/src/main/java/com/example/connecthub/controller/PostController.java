package com.example.connecthub.controller;

import com.example.connecthub.dto.request.CreatePostRequest;
import com.example.connecthub.dto.request.UpdatePostRequest;
import com.example.connecthub.dto.response.PostResponse;
import com.example.connecthub.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestBody CreatePostRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return new ResponseEntity<>(
                postService.createPost(email, request),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {

        return ResponseEntity.ok(
                postService.getAllPosts()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPostById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                postService.getPostById(id)
        );
    }

    @GetMapping("/community/{communityId}")
    public ResponseEntity<List<PostResponse>> getPostsByCommunity(
            @PathVariable Long communityId) {

        return ResponseEntity.ok(
                postService.getPostsByCommunity(communityId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePostRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return ResponseEntity.ok(
                postService.updatePost(id, email, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        postService.deletePost(id, email);

        return ResponseEntity.noContent().build();
    }
}
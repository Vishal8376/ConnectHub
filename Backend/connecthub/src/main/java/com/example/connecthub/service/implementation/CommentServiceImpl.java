package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.request.CreateCommentRequest;
import com.example.connecthub.dto.request.UpdateCommentRequest;
import com.example.connecthub.dto.response.CommentResponse;
import com.example.connecthub.entity.Comment;
import com.example.connecthub.entity.Post;
import com.example.connecthub.entity.User;
import com.example.connecthub.exception.AccessDeniedException;
import com.example.connecthub.exception.CommentNotFoundException;
import com.example.connecthub.exception.PostNotFoundException;
import com.example.connecthub.repository.CommentRepository;
import com.example.connecthub.repository.PostRepository;
import com.example.connecthub.repository.UserRepository;
import com.example.connecthub.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Override
    public CommentResponse createComment(
            Long postId,
            String email,
            CreateCommentRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new AccessDeniedException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() ->
                        new PostNotFoundException("Post not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .user(user)
                .post(post)
                .build();

        Comment savedComment = commentRepository.save(comment);

        return mapToResponse(savedComment);
    }

    @Override
    public List<CommentResponse> getCommentsByPost(Long postId) {

        if (!postRepository.existsById(postId)) {
            throw new PostNotFoundException("Post not found");
        }

        return commentRepository
                .findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CommentResponse updateComment(
            Long id,
            String email,
            UpdateCommentRequest request) {

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() ->
                        new CommentNotFoundException("Comment not found"));

        if (!comment.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException(
                    "Only the comment author can update this comment");
        }

        comment.setContent(request.getContent());

        Comment updatedComment = commentRepository.save(comment);

        return mapToResponse(updatedComment);
    }

    @Override
    public void deleteComment(
            Long id,
            String email) {

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() ->
                        new CommentNotFoundException("Comment not found"));

        if (!comment.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException(
                    "Only the comment author can delete this comment");
        }

        commentRepository.delete(comment);
    }

    private CommentResponse mapToResponse(Comment comment) {

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .author(comment.getUser().getFullName())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
package com.example.connecthub.repository;
import com.example.connecthub.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByCommunityIdOrderByCreatedAtDesc(Long communityId);
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);
}
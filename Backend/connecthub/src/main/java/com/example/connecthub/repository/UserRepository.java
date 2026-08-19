package com.example.connecthub.repository;

import com.example.connecthub.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
            SELECT DISTINCT u
            FROM User u
            LEFT JOIN u.interests i
            WHERE (:name IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :name, '%')))
              AND (:college IS NULL OR LOWER(u.college) LIKE LOWER(CONCAT('%', :college, '%')))
              AND (:profession IS NULL OR LOWER(u.profession) LIKE LOWER(CONCAT('%', :profession, '%')))
              AND (:location IS NULL OR LOWER(u.location) LIKE LOWER(CONCAT('%', :location, '%')))
              AND (:interestId IS NULL OR i.id = :interestId)
            """)
    List<User> searchUsers(
            @Param("name") String name,
            @Param("college") String college,
            @Param("profession") String profession,
            @Param("location") String location,
            @Param("interestId") Long interestId);
}
package com.example.connecthub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.example.connecthub.enums.Role;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Full name is required")
    @Column(nullable = false)
    private String fullName;

    @Email(message = "Invalid email")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must contain at least 8 characters")
    @Column(nullable = false)
    private String password;

    @Column(length = 500)
    private String bio;

    private String college;

    private String profession;

    private String location;

    private String profilePicture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.ROLE_USER;

    @Builder.Default
    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /*
     * ==============================
     * User Interests
     * ==============================
     */
    @ManyToMany
    @JoinTable(name = "user_interests", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "interest_id"))
    private Set<Interest> interests = new HashSet<>();

    /*
     * ==============================
     * Joined Communities
     * ==============================
     */
    @Builder.Default
    @ManyToMany
    @JoinTable(name = "user_communities", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "community_id"))
    private Set<Community> communities = new HashSet<>();

    /*
     * ==============================
     * Created Communities
     * ==============================
     */
    @OneToMany(mappedBy = "creator")
    private List<Community> createdCommunities;
    /*
     * ==============================
     * User Posts
     * ==============================
     */
    @OneToMany(mappedBy = "user")
    private List<Post> posts;

    /*
     * ==============================
     * User Comments
     * ==============================
     */
    @OneToMany(mappedBy = "user")
    private List<Comment> comments;

    /*
     * ==============================
     * Sent Connection Requests
     * ==============================
     */
    @OneToMany(mappedBy = "sender")
    private List<Connection> sentConnections;

    /*
     * ==============================
     * Received Connection Requests
     * ==============================
     */
    @OneToMany(mappedBy = "receiver")
    private List<Connection> receivedConnections;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
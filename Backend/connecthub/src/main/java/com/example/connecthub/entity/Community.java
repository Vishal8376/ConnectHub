package com.example.connecthub.entity;

import com.example.connecthub.enums.CommunityVisibility;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "communities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Community name is required")
    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    private String communityImage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommunityVisibility visibility;

    /*
     * ==============================
     * Community Creator
     * ==============================
     */
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User creator;

    /*
     * ==============================
     * Community Members
     * ==============================
     */
    @Builder.Default
    @ManyToMany(mappedBy = "communities")
    private Set<User> users = new java.util.HashSet<>();


    /*
     * ==============================
     * Community Posts
     * ==============================
     */
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL)
    private List<Post> posts;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

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
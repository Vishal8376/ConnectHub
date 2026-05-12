package com.prime.interest.Entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "communities")
public class Community {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Community_id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "interest_id")
    private Interest Interest_id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User User_id;

    @ManyToMany(mappedBy = "joinedCommunities")
    private List<User> members = new ArrayList<>();
}

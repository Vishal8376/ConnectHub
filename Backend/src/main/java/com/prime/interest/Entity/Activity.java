package com.prime.interest.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "activity")
@Data
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String Description;

    @ManyToOne
    @JoinColumn(name = "interest_id")
    private Interest Interest_id;

    @ManyToOne
    @JoinColumn(name = "community_id")
    private Community Community_id;
}

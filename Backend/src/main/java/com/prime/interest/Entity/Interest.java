package com.prime.interest.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "interests")
public class Interest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interest_id")
    private Long id;

    @Column(nullable = false)
    private String name;
}

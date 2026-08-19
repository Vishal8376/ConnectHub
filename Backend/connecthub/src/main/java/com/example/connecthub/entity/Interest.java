package com.example.connecthub.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "interests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Interest name is required")
    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 300)
    private String description;

    @ManyToMany(mappedBy = "interests")
    private List<User> users;
}
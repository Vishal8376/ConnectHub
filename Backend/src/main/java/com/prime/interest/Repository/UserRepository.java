package com.prime.interest.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.prime.interest.Entity.Interest;
import com.prime.interest.Entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    User findByUsername(String username);
    
    List<User> findByInterest(Interest interest);
}
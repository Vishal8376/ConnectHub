package com.prime.interest.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prime.interest.Entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    
    User findByUsername(String username);
}
package com.prime.interest.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prime.interest.Entity.Interest;

public interface InterestRepository extends JpaRepository<Interest, Long> {
    
}

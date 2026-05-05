package com.prime.interest.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prime.interest.Entity.Community;

public interface CommunityRepository extends JpaRepository<Community, Long> {
    
}

package com.prime.interest.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.prime.interest.Entity.Activity;  

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    
}

package com.prime.interest.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.prime.interest.Entity.Activity;

public interface ActivityRepository
    extends JpaRepository<Activity, Long> {

  @Query("""
          SELECT a
          FROM Activity a
          WHERE a.community.Community_id IN :communityIds
      """)
  List<Activity> findActivitiesByCommunityIds(
      @Param("communityIds") List<Long> communityIds);
}
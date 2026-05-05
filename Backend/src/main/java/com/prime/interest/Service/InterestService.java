package com.prime.interest.Service;

import org.springframework.stereotype.Service;

import com.prime.interest.Entity.Interest;
import com.prime.interest.Repository.InterestRepository;

@Service
public class InterestService {
    private final InterestRepository interest = null;

    public void addInterest(Long id , String name) {
        if(name == null || id == null) {
            throw new IllegalArgumentException("Name and description cannot be null");
        }

        Interest interestEntity = new Interest();
        interestEntity.setId(id);
        interestEntity.setName(name);
        interest.save(interestEntity);
    }
}

package com.prime.interest.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.prime.interest.Entity.Interest;
import com.prime.interest.Repository.InterestRepository;

@Service
public class InterestService {

    @Autowired
    private InterestRepository interestRepository;

    public void addInterest(Interest interest) {

        if(interest.getName() == null) {
            throw new IllegalArgumentException("Interest name cannot be null");
        }

        interestRepository.save(interest);
    }

    public Interest getInterestById(Long id) {
        return interestRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Interest not found"));
    }

    public void deleteInterest(Long id) {
        interestRepository.deleteById(id);
    }

    public void updateInterest(Interest interest) {
        Interest existingInterest = interestRepository.findById(interest.getId()).orElseThrow(() -> new IllegalArgumentException("Interest not found"));
        existingInterest.setName(interest.getName());
        interestRepository.save(existingInterest);
    }
}
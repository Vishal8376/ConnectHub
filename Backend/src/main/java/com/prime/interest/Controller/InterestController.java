package com.prime.interest.Controller;

import org.springframework.web.bind.annotation.*;

import com.prime.interest.Entity.Interest;
import com.prime.interest.Service.InterestService;

@RestController
@RequestMapping("/api/interests")
public class InterestController {

    private final InterestService interestService;

    public InterestController(InterestService interestService) {
        this.interestService = interestService;
    }

    @PostMapping("/add")
    public String addInterest(@RequestBody Interest interest) {

        interestService.addInterest(interest);

        return "Interest added successfully";
    }

    @GetMapping("/{id}")
    public Interest getInterestById(@PathVariable Long id) {
        return interestService.getInterestById(id);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteInterest(@PathVariable Long id) {
        interestService.deleteInterest(id);
        return "Interest deleted successfully";
    }

    @PutMapping("/update")
    public String updateInterest(@RequestBody Interest interest) {
        interestService.updateInterest(interest);
        return "Interest updated successfully";
    }
}
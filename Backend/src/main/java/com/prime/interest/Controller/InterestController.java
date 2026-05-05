package com.prime.interest.Controller;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.prime.interest.Service.InterestService;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping("/api/interests")
public class InterestController {
    private InterestService interestService;

    @PostMapping("/add")    
    public String addInterest(@RequestBody Long id , @RequestBody String name) {
        interestService.addInterest(id, name);
        return "Interest added successfully";
    }
}



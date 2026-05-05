package com.prime.interest.Service;
import com.prime.interest.Repository.UserRepository;

import com.prime.interest.Entity.User;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository = null;
    
    public void registerUser(String username, String password, String email) {
        
        if(username == null || password == null || email == null) {
            throw new IllegalArgumentException("Username, password, and email cannot be null");
        }
        User user = userRepository.findByUsername(username);
        
        if(user == null) {
            user = new User();
        }
        user.setUsername(username);
        user.setPassword(password);
        user.setEmail(email);
        userRepository.save(user);
    }
}

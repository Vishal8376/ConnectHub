package com.prime.interest.Service;

import com.prime.interest.Repository.UserRepository;
import com.prime.interest.Entity.Interest;
import com.prime.interest.Entity.User;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public void registerUser(User user) {
        if (user.getUsername() == null || user.getPassword() == null || user.getEmail() == null) {
            throw new IllegalArgumentException("Username, password, and email cannot be null");
        }
        userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void updateUser(User user) {
        if (user.getId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        userRepository.save(user);
    }

    public void loginUser(String username, String password) {
        User user = userRepository.findByUsername(username);
        if (user == null || !user.getPassword().equals(password)) {
            throw new IllegalArgumentException("Invalid username or password");
        }
    }

    public List<User> recommendUsers(Long userId) {

        User currentUser = userRepository
                .findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Interest interest = currentUser.getInterest();

        List<User> recommendedUsers = userRepository.findByInterest(interest);

        recommendedUsers.removeIf(
                user -> user.getId().equals(userId));

        return recommendedUsers;
    }
}

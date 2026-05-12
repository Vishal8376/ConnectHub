package com.prime.interest.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.prime.interest.Entity.User;
import com.prime.interest.Service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {

        userService.registerUser(user);

        return "User registered successfully";
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "User deleted successfully";
    }

    @PutMapping("/update")
    public String updateUser(@RequestBody User user) {
        userService.updateUser(user);
        return "User updated successfully";
    }

    @PostMapping("/login")
    public String loginUser(@RequestBody User user) {
        userService.loginUser(user.getUsername(), user.getPassword());
        return "User logged in successfully";
    }

    @GetMapping("/recommend/{userId}")
    public List<User> recommendUsers(@PathVariable Long userId) {
        return userService.recommendUsers(userId);
    }
}

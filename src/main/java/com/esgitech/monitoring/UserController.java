package com.esgitech.monitoring;

import com.esgitech.monitoring.entity.User;
import com.esgitech.monitoring.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // REGISTER
    @PostMapping
    public User createUser(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        return userRepository.save(user);
    }

    // LOGIN
    @PostMapping("/login")
    public User login(@RequestBody User loginRequest) {
        User user = userRepository.findByEmailAndPassword(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        if (user == null) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }

    // READ USERS
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/user/me
     * Returns the currently authenticated user (resolved by email from JWT subject).
     */
    @GetMapping("/me")
    public ResponseEntity<User> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getName();
        User user = userService.getByEmailOrThrow(email);
        return ResponseEntity.ok(user);
    }
}
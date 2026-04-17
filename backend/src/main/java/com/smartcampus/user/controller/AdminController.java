package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.RoleService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleService roleService;

    public AdminController(UserRepository userRepository, RoleService roleService) {
        this.userRepository = userRepository;
        this.roleService = roleService;
    }

    /**
     * GET /api/admin/users
     * Returns all users.
     * ADMIN only.
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /**
     * POST /api/admin/roles/assign
     * Assign a role to a user.
     * ADMIN only.
     *
     * Body:
     * {
     *   "userId": "string",
     *   "role": "ROLE_ADMIN"
     * }
     */
    @PostMapping("/roles/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> assignRole(@Valid @RequestBody AssignRoleRequest request) {
        User updated = roleService.assignRole(request.getUserId(), request.getRole());
        return ResponseEntity.ok(updated);
    }

    @Data
    public static class AssignRoleRequest {

        @NotBlank
        private String userId;

        @NotBlank
        private String role;
    }
}
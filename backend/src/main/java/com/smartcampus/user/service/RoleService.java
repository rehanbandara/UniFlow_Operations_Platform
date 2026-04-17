package com.smartcampus.service;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class RoleService {

    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";

    private final UserRepository userRepository;

    public RoleService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Assign a role to a user.
     *
     * @param userId   MongoDB user id
     * @param roleName Role name (ROLE_USER / ROLE_ADMIN)
     * @return updated User
     */
    public User assignRole(String userId, String roleName) {
        String normalizedRole = validateRoleExistence(roleName);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for id: " + userId));

        Set<Role> roles = user.getRoles();
        if (roles == null) {
            roles = new HashSet<>();
            user.setRoles(roles);
        }

        boolean alreadyHasRole = roles.stream()
                .anyMatch(r -> r != null && normalizedRole.equals(r.getName()));

        if (!alreadyHasRole) {
            roles.add(Role.builder().name(normalizedRole).build());
        }

        return userRepository.save(user);
    }

    /**
     * Remove a role from a user.
     *
     * @param userId   MongoDB user id
     * @param roleName Role name (ROLE_USER / ROLE_ADMIN)
     * @return updated User
     */
    public User removeRole(String userId, String roleName) {
        String normalizedRole = validateRoleExistence(roleName);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for id: " + userId));

        Set<Role> roles = user.getRoles();
        if (roles == null || roles.isEmpty()) {
            return user; // nothing to remove
        }

        roles.removeIf(r -> r != null && normalizedRole.equals(r.getName()));

        // Optional safety: ensure user always has at least ROLE_USER.
        // This keeps system stable and aligns with "ROLE_USER default".
        if (roles.isEmpty()) {
            roles.add(Role.builder().name(ROLE_USER).build());
        }

        return userRepository.save(user);
    }

    /**
     * Validates the role exists in the system (static validation).
     * If invalid, throws IllegalArgumentException.
     *
     * @param roleName input role name
     * @return normalized role name
     */
    public String validateRoleExistence(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            throw new IllegalArgumentException("roleName must not be blank");
        }

        String normalized = roleName.trim();

        if (!ROLE_USER.equals(normalized) && !ROLE_ADMIN.equals(normalized)) {
            throw new IllegalArgumentException("Invalid role: " + normalized + ". Allowed: " + ROLE_USER + ", " + ROLE_ADMIN);
        }

        return normalized;
    }
}
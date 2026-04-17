package com.smartcampus.service;

import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    public static final String ROLE_USER = "ROLE_USER";

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User processOAuthPostLogin(String name, String email) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User u = existing.get();
            // Optional: keep name in sync with Google profile
            if (name != null && !name.isBlank() && (u.getName() == null || u.getName().isBlank() || !u.getName().equals(name))) {
                u.setName(name);
                return userRepository.save(u);
            }
            return u;
        }

        User newUser = User.builder()
                .name(name != null && !name.isBlank() ? name : "Unknown")
                .email(email)
                .roles(Set.of(Role.builder().name(ROLE_USER).build()))
                .build();

        try {
            return userRepository.save(newUser);
        } catch (DuplicateKeyException ex) {
            // If two logins race, the unique email index could trigger duplicate key.
            // In that case, just read the existing user.
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> ex);
        }
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found for email: " + email));
    }
}
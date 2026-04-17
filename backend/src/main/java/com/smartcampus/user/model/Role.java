package com.smartcampus.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Stored as an embedded document inside User.roles (simple and Mongo-friendly).
 * Name values: ROLE_USER, ROLE_ADMIN (and optionally ROLE_TECHNICIAN later).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @NotBlank
    private String name;
}
package com.smartcampus.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityRequest {

    @NotBlank(message = "Facility name is required")
    private String name;

   
    @NotBlank(message = "Facility type is required")
    private String type;

    @Min(value = 0, message = "Capacity must be 0 or greater")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;
}
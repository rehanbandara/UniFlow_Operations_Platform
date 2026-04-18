package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityResponse {

    private String id;

    private String name;

    private String type;

    private int capacity;

    private String location;

    private String description;
}
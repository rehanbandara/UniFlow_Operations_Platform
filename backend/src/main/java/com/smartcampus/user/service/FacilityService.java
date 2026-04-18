package com.smartcampus.service;

import com.smartcampus.dto.FacilityRequest;
import com.smartcampus.dto.FacilityResponse;
import com.smartcampus.model.Facility;
import com.smartcampus.repository.FacilityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    public FacilityResponse createFacility(FacilityRequest request) {
        Facility facility = Facility.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .build();

        Facility saved = facilityRepository.save(facility);
        return toResponse(saved);
    }

    public FacilityResponse updateFacility(String id, FacilityRequest request) {
        Facility existing = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found: " + id));

        existing.setName(request.getName());
        existing.setType(request.getType());
        existing.setCapacity(request.getCapacity());
        existing.setLocation(request.getLocation());
        existing.setDescription(request.getDescription());

        Facility saved = facilityRepository.save(existing);
        return toResponse(saved);
    }

    public void deleteFacility(String id) {
        Facility existing = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found: " + id));

        facilityRepository.delete(existing);
    }

    public List<FacilityResponse> getAllFacilities() {
        return facilityRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FacilityResponse getFacilityById(String id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Facility not found: " + id));

        return toResponse(facility);
    }

    private FacilityResponse toResponse(Facility facility) {
        return FacilityResponse.builder()
                .id(facility.getId())
                .name(facility.getName())
                .type(facility.getType())
                .capacity(facility.getCapacity())
                .location(facility.getLocation())
                .description(facility.getDescription())
                .build();
    }
}
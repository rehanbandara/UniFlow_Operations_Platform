package com.smartcampus.controller;

import com.smartcampus.dto.FacilityRequest;
import com.smartcampus.dto.FacilityResponse;
import com.smartcampus.service.FacilityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    /**
     * GET /api/facilities
     * Any authenticated user can view facilities.
     */
    @GetMapping
    public ResponseEntity<List<FacilityResponse>> getAllFacilities() {
        return ResponseEntity.ok(facilityService.getAllFacilities());
    }

    /**
     * GET /api/facilities/{id}
     * Any authenticated user can view a facility.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FacilityResponse> getFacilityById(@PathVariable String id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    /**
     * POST /api/facilities
     * ADMIN only.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacilityResponse> createFacility(@Valid @RequestBody FacilityRequest request) {
        return ResponseEntity.ok(facilityService.createFacility(request));
    }

    /**
     * PUT /api/facilities/{id}
     * ADMIN only.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacilityResponse> updateFacility(@PathVariable String id,
                                                          @Valid @RequestBody FacilityRequest request) {
        return ResponseEntity.ok(facilityService.updateFacility(id, request));
    }

    /**
     * DELETE /api/facilities/{id}
     * ADMIN only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFacility(@PathVariable String id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }
}
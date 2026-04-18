package com.smartcampus.repository;

import com.smartcampus.model.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FacilityRepository extends MongoRepository<Facility, String> {
}
package com.smartcampus.booking.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Booking document stored in MongoDB.
 *
 * Conflict logic is enforced in the service layer.
 */
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String facilityId;

    @Indexed
    private LocalDateTime startTime;

    @Indexed
    private LocalDateTime endTime;

    @Indexed
    private BookingStatus status;

    public Booking() {
    }

    public Booking(String id, String userId, String facilityId, LocalDateTime startTime, LocalDateTime endTime, BookingStatus status) {
        this.id = id;
        this.userId = userId;
        this.facilityId = facilityId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFacilityId() {
        return facilityId;
    }

    public void setFacilityId(String facilityId) {
        this.facilityId = facilityId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}
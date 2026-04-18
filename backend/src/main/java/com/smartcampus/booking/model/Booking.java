package com.smartcampus.booking.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Booking document stored in MongoDB.
 *
 * Performance note:
 * - Conflict checks query by facilityId + status + (startTime,endTime) overlap.
 * - The compound index below improves that query for real-world scale.
 */
@Document(collection = "bookings")
@CompoundIndexes({
        @CompoundIndex(
                name = "facility_status_time_idx",
                def = "{'facilityId':1,'status':1,'startTime':1,'endTime':1}"
        )
})
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

    /**
     * Optional reason set by admin when rejecting a booking.
     * (Only meaningful when status == REJECTED)
     */
    private String rejectReason;

    public Booking() {
    }

    public Booking(String id,
                   String userId,
                   String facilityId,
                   LocalDateTime startTime,
                   LocalDateTime endTime,
                   BookingStatus status,
                   String rejectReason) {
        this.id = id;
        this.userId = userId;
        this.facilityId = facilityId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.rejectReason = rejectReason;
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

    public String getRejectReason() {
        return rejectReason;
    }

    public void setRejectReason(String rejectReason) {
        this.rejectReason = rejectReason;
    }
}
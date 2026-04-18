package com.smartcampus.booking.dto;

import com.smartcampus.booking.model.BookingStatus;
import java.time.LocalDateTime;

public class BookingResponse {

    private String id;
    private String userId;
    private String facilityId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;

    /**
     * Optional: populated when status is REJECTED (set by admin).
     */
    private String rejectReason;

    public BookingResponse() {
    }

    public BookingResponse(String id,
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


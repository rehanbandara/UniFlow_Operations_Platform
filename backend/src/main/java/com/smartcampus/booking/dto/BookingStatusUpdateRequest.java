package com.smartcampus.booking.dto;

/**
 * Used for admin status updates (e.g., reject with a reason).
 */
public class BookingStatusUpdateRequest {

    private String reason;

    public BookingStatusUpdateRequest() {
    }

    public BookingStatusUpdateRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
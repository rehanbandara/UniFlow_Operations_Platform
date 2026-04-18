package com.smartcampus.booking.repository;

import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {

    /**
     * Returns bookings that overlap the requested time range for the same facility.
     *
     * Conflict condition:
     * existing.startTime < requestedEnd AND existing.endTime > requestedStart
     *
     * Status filter is used so cancelled/rejected bookings do not block the slot.
     */
    List<Booking> findByFacilityIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            String facilityId,
            Collection<BookingStatus> statuses,
            LocalDateTime requestedEnd,
            LocalDateTime requestedStart
    );

    List<Booking> findByUserIdOrderByStartTimeDesc(String userId);

    List<Booking> findAllByOrderByStartTimeDesc();
}
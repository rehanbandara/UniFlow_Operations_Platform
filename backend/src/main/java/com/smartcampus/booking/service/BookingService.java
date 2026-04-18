package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.notification.service.NotificationService;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private static final EnumSet<BookingStatus> CONFLICT_STATUSES =
            EnumSet.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository, NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest req) {
        Authentication auth = requireAuth();
        String userId = currentUserId(auth);

        validateTimeRange(req.getStartTime(), req.getEndTime());
        ensureNoConflict(req.getFacilityId(), req.getStartTime(), req.getEndTime(), null);

        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setFacilityId(req.getFacilityId());
        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());
        booking.setStatus(BookingStatus.PENDING);
        booking.setRejectReason(null);

        Booking saved = bookingRepository.save(booking);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        Authentication auth = requireAuth();
        String userId = currentUserId(auth);

        return bookingRepository.findByUserIdOrderByStartTimeDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        Authentication auth = requireAuth();
        requireAdmin(auth);

        return bookingRepository.findAllByOrderByStartTimeDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse approveBooking(String bookingId) {
        Authentication auth = requireAuth();
        requireAdmin(auth);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved");
        }

        validateTimeRange(booking.getStartTime(), booking.getEndTime());
        ensureNoConflict(booking.getFacilityId(), booking.getStartTime(), booking.getEndTime(), booking.getId());

        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectReason(null); // clear any previous reason

        Booking saved = bookingRepository.save(booking);

        // Notification trigger (non-blocking)
        try {
            notificationService.createNotification(saved.getUserId(), "Your booking has been approved");
        } catch (Exception ignored) {
            // booking approval should not fail if notification fails
        }

        return toResponse(saved);
    }

    @Transactional
    public BookingResponse rejectBooking(String bookingId) {
        return rejectBooking(bookingId, null);
    }

    @Transactional
    public BookingResponse rejectBooking(String bookingId, String reason) {
        Authentication auth = requireAuth();
        requireAdmin(auth);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);

        String cleaned = (reason == null) ? null : reason.trim();
        booking.setRejectReason((cleaned == null || cleaned.isBlank()) ? null : cleaned);

        Booking saved = bookingRepository.save(booking);

        // Notification trigger (non-blocking)
        String msg = (saved.getRejectReason() != null && !saved.getRejectReason().isBlank())
                ? "Your booking has been rejected: " + saved.getRejectReason()
                : "Your booking has been rejected";
        try {
            notificationService.createNotification(saved.getUserId(), msg);
        } catch (Exception ignored) {
            // booking rejection should not fail if notification fails
        }

        return toResponse(saved);
    }

    @Transactional
    public BookingResponse cancelBooking(String bookingId) {
        Authentication auth = requireAuth();
        String userId = currentUserId(auth);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if (!userId.equals(booking.getUserId())) {
            throw new SecurityException("Only the booking owner can cancel this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setRejectReason(null); // not relevant after cancel
        return toResponse(bookingRepository.save(booking));
    }

    // -------------------------
    // Validation & helpers
    // -------------------------

    private void validateTimeRange(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("startTime and endTime are required");
        }
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }
    }

    private void ensureNoConflict(String facilityId, LocalDateTime start, LocalDateTime end, String excludeBookingId) {
        if (facilityId == null || facilityId.isBlank()) {
            throw new IllegalArgumentException("facilityId is required");
        }

        List<Booking> conflicts = bookingRepository
                .findByFacilityIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                        facilityId,
                        CONFLICT_STATUSES,
                        end,
                        start
                );

        if (excludeBookingId != null) {
            conflicts = conflicts.stream()
                    .filter(b -> b.getId() != null && !b.getId().equals(excludeBookingId))
                    .toList();
        }

        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Time conflict: facility is already booked for the requested time range");
        }
    }

    private BookingResponse toResponse(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getUserId(),
                b.getFacilityId(),
                b.getStartTime(),
                b.getEndTime(),
                b.getStatus(),
                b.getRejectReason()
        );
    }

    private Authentication requireAuth() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !a.isAuthenticated()) {
            throw new SecurityException("Unauthenticated");
        }
        return a;
    }

    private String currentUserId(Authentication a) {
        String name = a.getName();
        if (name == null || name.isBlank()) {
            throw new SecurityException("Missing authenticated user identity");
        }
        return name;
    }

    private void requireAdmin(Authentication a) {
        if (!isAdmin(a)) {
            throw new SecurityException("Admin access required");
        }
    }

    private boolean isAdmin(Authentication a) {
        for (GrantedAuthority ga : a.getAuthorities()) {
            if (ga != null && "ROLE_ADMIN".equals(ga.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
package com.smartcampus.booking.controller;

import com.smartcampus.booking.dto.BookingRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.dto.BookingStatusUpdateRequest;
import com.smartcampus.booking.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // USER creates booking
    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        try {
            BookingResponse created = bookingService.createBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (IllegalStateException e) {
            // conflict
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // USER gets own bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> myBookings() {
        try {
            return ResponseEntity.ok(bookingService.getMyBookings());
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // ADMIN gets all bookings
    @GetMapping
    public ResponseEntity<List<BookingResponse>> allBookings() {
        try {
            return ResponseEntity.ok(bookingService.getAllBookings());
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // ADMIN approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approve(@PathVariable("id") String id) {
        try {
            return ResponseEntity.ok(bookingService.approveBooking(id));
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // ADMIN reject (optional request body for reason)
    @PutMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> reject(@PathVariable("id") String id,
                                                 @RequestBody(required = false) BookingStatusUpdateRequest ignored) {
        try {
            return ResponseEntity.ok(bookingService.rejectBooking(id));
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // OWNER cancel
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(@PathVariable("id") String id) {
        try {
            return ResponseEntity.ok(bookingService.cancelBooking(id));
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }
}
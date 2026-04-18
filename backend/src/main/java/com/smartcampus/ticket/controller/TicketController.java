package com.smartcampus.ticket.controller;

import com.smartcampus.ticket.dto.TicketRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.service.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tickets")
@Validated
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // USER creates ticket
    @PostMapping
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody TicketRequest request) {
        try {
            TicketResponse created = ticketService.createTicket(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // ADMIN gets all tickets
    @GetMapping
    public ResponseEntity<List<TicketResponse>> all() {
        try {
            return ResponseEntity.ok(ticketService.getAllTickets());
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // USER gets own tickets
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> my() {
        try {
            return ResponseEntity.ok(ticketService.getMyTickets());
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // ADMIN assigns ticket
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assign(@PathVariable("id") String id,
                                                 @Valid @RequestBody AssignTicketRequest request) {
        try {
            return ResponseEntity.ok(ticketService.assignTicket(id, request.getUserId()));
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // ADMIN marks RESOLVED
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<TicketResponse> resolve(@PathVariable("id") String id) {
        try {
            return ResponseEntity.ok(ticketService.resolveTicket(id));
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    // ADMIN marks CLOSED
    @PatchMapping("/{id}/close")
    public ResponseEntity<TicketResponse> close(@PathVariable("id") String id) {
        try {
            return ResponseEntity.ok(ticketService.closeTicket(id));
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
    }

    @Data
    @NoArgsConstructor
    public static class AssignTicketRequest {
        @NotBlank(message = "userId is required")
        private String userId;
    }
}
package com.smartcampus.ticket.service;

import com.smartcampus.notification.service.NotificationService;
import com.smartcampus.ticket.dto.TicketRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.repository.TicketRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    // -------------------------
    // Public API
    // -------------------------

    @Transactional
    public TicketResponse createTicket(TicketRequest request) {
        Authentication auth = requireAuth();
        requireUserOrAdmin(auth); // allow any authenticated user, but aligns with USER create requirement

        String userId = currentUserId(auth);

        Ticket ticket = Ticket.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .status(Ticket.Status.OPEN)
                .createdBy(userId)
                .assignedTo(null)
                .createdAt(LocalDateTime.now())
                .build();

        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        Authentication auth = requireAuth();
        requireAdmin(auth);

        return ticketRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets() {
        Authentication auth = requireAuth();
        requireUserOrAdmin(auth);

        String userId = currentUserId(auth);

        return ticketRepository.findByCreatedByOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TicketResponse assignTicket(String ticketId, String assignedUserId) {
        Authentication auth = requireAuth();
        requireAdmin(auth);

        String cleanedUserId = (assignedUserId == null) ? "" : assignedUserId.trim();
        if (cleanedUserId.isBlank()) {
            throw new IllegalArgumentException("userId is required for assignment");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found"));

        if (ticket.getStatus() == Ticket.Status.CLOSED) {
            throw new IllegalStateException("Cannot assign a CLOSED ticket");
        }

        ticket.setAssignedTo(cleanedUserId);
        ticket.setStatus(Ticket.Status.IN_PROGRESS);

        Ticket saved = ticketRepository.save(ticket);

        // Notification trigger (non-blocking): notify assigned user
        try {
            String title = (saved.getTitle() == null || saved.getTitle().isBlank()) ? "a ticket" : saved.getTitle();
            notificationService.createNotification(
                    cleanedUserId,
                    "You have been assigned ticket: " + title
            );
        } catch (Exception ignored) {
            // assignment should not fail if notification fails
        }

        return toResponse(saved);
    }

    @Transactional
    public TicketResponse resolveTicket(String ticketId) {
        Authentication auth = requireAuth();
        requireAdmin(auth);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found"));

        if (ticket.getStatus() == Ticket.Status.CLOSED) {
            throw new IllegalStateException("Cannot resolve a CLOSED ticket");
        }

        ticket.setStatus(Ticket.Status.RESOLVED);

        Ticket saved = ticketRepository.save(ticket);

        // Notification trigger (non-blocking): notify ticket creator
        try {
            String title = (saved.getTitle() == null || saved.getTitle().isBlank()) ? "Your ticket" : ("Your ticket: " + saved.getTitle());
            notificationService.createNotification(
                    saved.getCreatedBy(),
                    title + " has been resolved"
            );
        } catch (Exception ignored) {
            // resolve should not fail if notification fails
        }

        return toResponse(saved);
    }

    @Transactional
    public TicketResponse closeTicket(String ticketId) {
        Authentication auth = requireAuth();
        requireAdmin(auth);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found"));

        if (ticket.getStatus() == Ticket.Status.CLOSED) {
            return toResponse(ticket); // idempotent
        }

        ticket.setStatus(Ticket.Status.CLOSED);
        return toResponse(ticketRepository.save(ticket));
    }

    // -------------------------
    // Mapping
    // -------------------------

    private TicketResponse toResponse(Ticket ticket) {
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .createdBy(ticket.getCreatedBy())
                .assignedTo(ticket.getAssignedTo())
                .createdAt(ticket.getCreatedAt())
                .build();
    }

    // -------------------------
    // Auth helpers (no changes to existing security config required)
    // -------------------------

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
        if (!hasRole(a, "ROLE_ADMIN")) {
            throw new SecurityException("Admin access required");
        }
    }

    private void requireUserOrAdmin(Authentication a) {
        // For this module, both ROLE_USER and ROLE_ADMIN are considered authenticated actors.
        if (!hasRole(a, "ROLE_USER") && !hasRole(a, "ROLE_ADMIN")) {
            throw new SecurityException("User access required");
        }
    }

    private boolean hasRole(Authentication a, String role) {
        for (GrantedAuthority ga : a.getAuthorities()) {
            if (ga != null && role.equals(ga.getAuthority())) {
                return true;
            }
        }
        return false;
    }
}
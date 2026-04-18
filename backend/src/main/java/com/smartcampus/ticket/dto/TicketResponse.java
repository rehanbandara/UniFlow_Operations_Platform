package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.model.Ticket;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {

    private String id;
    private String title;
    private String description;
    private Ticket.Status status;
    private String createdBy;
    private String assignedTo;
    private LocalDateTime createdAt;
}
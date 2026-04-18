package com.smartcampus.ticket.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    public enum Status {
        OPEN,
        IN_PROGRESS,
        RESOLVED,
        CLOSED
    }

    @Id
    private String id;

    @Indexed
    private String title;

    private String description;

    @Indexed
    private Status status;

    @Indexed
    private String createdBy;

    @Indexed
    private String assignedTo; // nullable

    @Indexed
    private LocalDateTime createdAt;
}
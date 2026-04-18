package com.smartcampus.notification.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
@CompoundIndex(name = "user_createdAt_idx", def = "{'userId': 1, 'createdAt': -1}")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String message;

    @Builder.Default
    private boolean read = false;

    @Indexed
    private LocalDateTime createdAt;
}
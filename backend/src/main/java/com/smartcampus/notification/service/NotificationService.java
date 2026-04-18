package com.smartcampus.notification.service;

import com.smartcampus.notification.model.Notification;
import com.smartcampus.notification.repository.NotificationRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(String userId, String message) {
        String uid = (userId == null) ? "" : userId.trim();
        String msg = (message == null) ? "" : message.trim();

        if (uid.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }
        if (msg.isBlank()) {
            throw new IllegalArgumentException("message is required");
        }

        Notification n = Notification.builder()
                .userId(uid)
                .message(msg)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(String userId) {
        String uid = (userId == null) ? "" : userId.trim();
        if (uid.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(uid);
    }

    @Transactional
    public Notification markAsRead(String notificationId, String userId) {
        String nid = (notificationId == null) ? "" : notificationId.trim();
        String uid = (userId == null) ? "" : userId.trim();

        if (nid.isBlank()) {
            throw new IllegalArgumentException("notificationId is required");
        }
        if (uid.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }

        Notification n = notificationRepository.findById(nid)
                .orElseThrow(() -> new NoSuchElementException("Notification not found"));

        if (n.getUserId() == null || !n.getUserId().equals(uid)) {
            throw new SecurityException("You can only modify your own notifications");
        }

        if (!n.isRead()) {
            n.setRead(true);
            n = notificationRepository.save(n);
        }

        return n;
    }

    public String getCurrentUserId() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !a.isAuthenticated()) {
            throw new SecurityException("Unauthenticated");
        }
        String name = a.getName();
        if (name == null || name.isBlank()) {
            throw new SecurityException("Missing authenticated user identity");
        }
        return name;
    }
}
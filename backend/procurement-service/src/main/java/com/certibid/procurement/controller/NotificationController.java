package com.certibid.procurement.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.certibid.procurement.dto.response.NotificationResponse;
import com.certibid.procurement.entity.Notification;
import com.certibid.procurement.exception.ResourceNotFoundException;
import com.certibid.procurement.repository.NotificationRepository;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        List<Notification> list = (userId != null && !userId.isBlank())
                ? notificationRepository.findByUserId(userId)
                : notificationRepository.findAll();

        List<NotificationResponse> responses = list.stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .userId(n.getUserId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .type(n.getType())
                        .isRead(n.getIsRead())
                        .timestamp(n.getTimestamp())
                        .build()
                )
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable String id) {

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Notification not found with id: " + id));

        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);

        return ResponseEntity.ok(
                NotificationResponse.builder()
                        .id(updated.getId())
                        .userId(updated.getUserId())
                        .title(updated.getTitle())
                        .message(updated.getMessage())
                        .type(updated.getType())
                        .isRead(updated.getIsRead())
                        .timestamp(updated.getTimestamp())
                        .build()
        );
    }
}
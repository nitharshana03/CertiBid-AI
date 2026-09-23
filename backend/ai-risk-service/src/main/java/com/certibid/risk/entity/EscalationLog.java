package com.certibid.risk.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "escalation_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalationLog {

    @Id
    private String id;

    @Column(nullable = false)
    private String bidId;

    @Column(nullable = false)
    private String escalatedBy;

    @Column(nullable = false)
    private String escalatedTo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    private String urgency;
    private String status;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = "ESC-" + java.util.UUID.randomUUID().toString().substring(0, 8);
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (urgency == null) urgency = "HIGH";
        if (status == null) status = "OPEN";
    }
}

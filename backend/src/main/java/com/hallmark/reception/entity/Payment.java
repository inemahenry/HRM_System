package com.hallmark.reception.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long guestId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String method;

    @Column(nullable = false)
    private String paymentType;

    private String reference;

    private String notes;

    private String receptionistName;

    private String receptionistUsername;

    private String paymentDuration;

    private Integer durationDays;

    private LocalDate dueDate;

    private BigDecimal previousBalance;

    private BigDecimal remainingBalance;

    @Column(nullable = false)
    private LocalDateTime paidAt;

    @PrePersist
    void prePersist() {
        if (paidAt == null) {
            paidAt = LocalDateTime.now();
        }
    }
}

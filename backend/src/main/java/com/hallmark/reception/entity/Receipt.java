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
@Table(name = "receipts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String receiptNumber;

    @Column(nullable = false)
    private Long paymentId;

    @Column(nullable = false)
    private Long guestId;

    @Column(nullable = false)
    private BigDecimal amount;

    private String status;

    private String notes;

    private String guestName;

    private String villaNumber;

    private String primaryTenant;

    private String phoneNumber;

    private BigDecimal previousBalance;

    private BigDecimal remainingBalance;

    private LocalDate dueDate;

    private String receivedBy;

    private String paymentMethod;

    private String paymentType;

    private String reference;

    private String paymentDuration;

    private Integer durationDays;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @PrePersist
    void prePersist() {
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "ISSUED";
        }
    }
}

package com.hallmark.reception.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "guests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    @Column(nullable = false)
    private String idNumber;

    @Column(nullable = false)
    private String nationality;

    private String email;

    @Column(nullable = false)
    private String stayStatus;

    @Column(nullable = false)
    private String paymentStatus;

    private LocalDate checkInDate;

    private LocalDate checkOutDate;

    private BigDecimal totalAmount;

    private BigDecimal amountPaid;

    private BigDecimal remainingBalance;

    private Long villaId;

    private String villaNumber;

    private String notes;

    @Version
    private Long version;
}

package com.hallmark.reception.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "villas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Villa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String number;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean rentable = true;

    private Long guestId;

    private String guestName;

    private Long primaryTenantId;

    private String primaryTenantName;

    private String checkOutDate;

    private String type;

    private Integer occupancy;

    private String rentStatus;

    private String cleaningPaymentStatus;

    private String cleaningDay;

    private String assignedCleaners;

    private java.time.LocalDate cleaningNextDueDate;

    private String notes;
}

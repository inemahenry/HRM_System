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

    private Long guestId;

    private String guestName;

    private String checkOutDate;

    private String type;

    private String notes;
}

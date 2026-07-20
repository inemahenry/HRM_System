package com.hallmark.reception.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VillaRequestDto {
    @NotBlank
    private String number;

    @NotBlank
    private String status;

    private Long guestId;

    private String guestName;

    private String checkOutDate;

    private String type;

    private Integer occupancy;

    private String rentStatus;

    private String cleaningPaymentStatus;

    private String cleaningDay;

    private String assignedCleaners;

    private String notes;
}

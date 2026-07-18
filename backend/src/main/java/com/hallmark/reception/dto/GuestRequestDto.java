package com.hallmark.reception.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GuestRequestDto {
    @NotBlank
    private String fullName;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private String idNumber;

    @NotBlank
    private String nationality;

    private String email;

    @NotBlank
    private String stayStatus;

    @NotBlank
    private String paymentStatus;

    @NotNull
    private LocalDate checkInDate;

    private LocalDate checkOutDate;

    private BigDecimal totalAmount;

    private BigDecimal amountPaid;

    private BigDecimal remainingBalance;

    private Long villaId;

    private String villaNumber;

    private String notes;
}

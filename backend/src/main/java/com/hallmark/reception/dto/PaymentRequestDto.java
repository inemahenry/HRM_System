package com.hallmark.reception.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequestDto {
    @NotNull
    private Long guestId;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotBlank
    private String method;

    private String reference;

    private String notes;
}

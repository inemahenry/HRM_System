package com.hallmark.reception.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequestDto {
    @NotNull
    private Long guestId;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private String method;

    private String reference;

    private String notes;
}

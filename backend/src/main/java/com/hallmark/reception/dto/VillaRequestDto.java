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

    private String notes;
}

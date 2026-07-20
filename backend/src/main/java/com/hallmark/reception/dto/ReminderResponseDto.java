package com.hallmark.reception.dto;

import java.time.LocalDate;

public record ReminderResponseDto(
        String id,
        String type,
        String title,
        String message,
        Long guestId,
        Long villaId,
        LocalDate dueDate,
        boolean overdue
) {
}

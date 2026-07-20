package com.hallmark.reception.service;

import com.hallmark.reception.dto.ReminderResponseDto;

import java.util.List;

public interface ReminderService {
    List<ReminderResponseDto> findActiveReminders();
}

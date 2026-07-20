package com.hallmark.reception.controller;

import com.hallmark.reception.dto.ReminderResponseDto;
import com.hallmark.reception.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;

    @GetMapping
    public ResponseEntity<List<ReminderResponseDto>> findActiveReminders() {
        return ResponseEntity.ok(reminderService.findActiveReminders());
    }
}

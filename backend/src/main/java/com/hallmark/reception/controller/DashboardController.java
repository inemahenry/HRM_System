package com.hallmark.reception.controller;

import com.hallmark.reception.dto.ReminderResponseDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.VillaRepository;
import com.hallmark.reception.service.GuestService;
import com.hallmark.reception.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final GuestRepository guestRepository;
    private final VillaRepository villaRepository;
    private final ReminderService reminderService;
    private final GuestService guestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> dashboard() {
        guestService.activateDueBookings();
        List<Guest> guests = guestRepository.findAll().stream()
                .filter(guest -> !"14".equals(guest.getVillaNumber()))
                .toList();
        List<Villa> villas = villaRepository.findAll().stream()
                .filter(Villa::isRentable)
                .filter(villa -> !"14".equals(villa.getNumber()))
                .toList();
        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.plusDays(6);
        List<ReminderResponseDto> reminders = reminderService.findActiveReminders();
        List<Guest> activeGuests = guests.stream()
                .filter(guest -> !"CHECKED_OUT".equalsIgnoreCase(guest.getStayStatus()))
                .filter(guest -> !"Checked Out".equalsIgnoreCase(guest.getStayStatus()))
                .toList();

        Map<String, Object> payload = new HashMap<>();
        payload.put("totalVillas", villas.size());
        payload.put("occupiedVillas", villas.stream().filter(v -> "OCCUPIED".equalsIgnoreCase(v.getStatus())).count());
        payload.put("vacantVillas", villas.stream().filter(v -> "VACANT".equalsIgnoreCase(v.getStatus())).count());
        payload.put("bookedVillas", guests.stream()
                .filter(guest -> "BOOKED".equalsIgnoreCase(guest.getStayStatus()))
                .map(Guest::getVillaId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .count());
        payload.put("rentPaymentsDue", reminders.stream().filter(reminder -> reminder.type().startsWith("RENT_")).count());
        payload.put("cleaningPaymentsDue", reminders.stream().filter(reminder -> reminder.type().startsWith("CLEANING_")).count());
        payload.put("guestsCheckingOutToday", activeGuests.stream().filter(g -> today.equals(g.getCheckOutDate())).count());
        payload.put("guestsCheckingOutThisWeek", activeGuests.stream()
                .filter(g -> g.getCheckOutDate() != null)
                .filter(g -> !g.getCheckOutDate().isBefore(today) && !g.getCheckOutDate().isAfter(endOfWeek))
                .count());
        payload.put("actionRequired", reminders.size());
        payload.put("reminders", reminders);
        return ResponseEntity.ok(payload);
    }
}

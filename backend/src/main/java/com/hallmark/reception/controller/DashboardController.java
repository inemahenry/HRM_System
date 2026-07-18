package com.hallmark.reception.controller;

import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.VillaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final GuestRepository guestRepository;
    private final VillaRepository villaRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Map<String, Object>> dashboard() {
        List<Guest> guests = guestRepository.findAll();
        List<Villa> villas = villaRepository.findAll();
        LocalDate today = LocalDate.now();

        Map<String, Object> payload = new HashMap<>();
        payload.put("totalVillas", villas.size());
        payload.put("occupiedVillas", villas.stream().filter(v -> "OCCUPIED".equalsIgnoreCase(v.getStatus())).count());
        payload.put("vacantVillas", villas.stream().filter(v -> "VACANT".equalsIgnoreCase(v.getStatus())).count());
        payload.put("maintenanceVillas", villas.stream().filter(v -> "MAINTENANCE".equalsIgnoreCase(v.getStatus())).count());
        payload.put("cleaningVillas", villas.stream().filter(v -> "CLEANING".equalsIgnoreCase(v.getStatus())).count());
        payload.put("totalGuests", guests.size());
        payload.put("guestsCheckedInToday", guests.stream().filter(g -> g.getCheckInDate() != null && g.getCheckInDate().equals(today)).count());
        payload.put("guestsCheckingOutToday", guests.stream().filter(g -> g.getCheckOutDate() != null && g.getCheckOutDate().equals(today)).count());
        payload.put("paymentsReceivedToday", 0L);
        payload.put("paymentsDueToday", 0L);
        payload.put("outstandingBalances", guests.stream().map(Guest::getRemainingBalance).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add));
        payload.put("recentActivity", List.of("Dashboard initialized", "Villa and guest records available"));
        return ResponseEntity.ok(payload);
    }
}

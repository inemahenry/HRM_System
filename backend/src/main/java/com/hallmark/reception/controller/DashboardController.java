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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        Map<String, Object> payload = new HashMap<>();
        payload.put("totalGuests", guests.size());
        payload.put("checkedInGuests", guests.stream().filter(g -> "Staying".equalsIgnoreCase(g.getStayStatus())).count());
        payload.put("checkedOutGuests", guests.stream().filter(g -> "Checked Out".equalsIgnoreCase(g.getStayStatus())).count());
        payload.put("totalVillas", villas.size());
        payload.put("occupiedVillas", villas.stream().filter(v -> "Occupied".equalsIgnoreCase(v.getStatus())).count());
        payload.put("availableVillas", villas.stream().filter(v -> "Available".equalsIgnoreCase(v.getStatus())).count());
        return ResponseEntity.ok(payload);
    }
}

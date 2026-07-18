package com.hallmark.reception.controller;

import com.hallmark.reception.dto.GuestRequestDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.service.GuestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guests")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<List<Guest>> findAll() {
        return ResponseEntity.ok(guestService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Guest> findById(@PathVariable Long id) {
        return ResponseEntity.ok(guestService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Guest> create(@Valid @RequestBody GuestRequestDto request) {
        return new ResponseEntity<>(guestService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Guest> update(@PathVariable Long id, @Valid @RequestBody GuestRequestDto request) {
        return ResponseEntity.ok(guestService.update(id, request));
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Guest> checkIn(@PathVariable Long id, @RequestBody(required = false) GuestRequestDto request) {
        return ResponseEntity.ok(guestService.checkIn(id, request));
    }

    @PostMapping("/{id}/check-out")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Guest> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(guestService.checkOut(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        guestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

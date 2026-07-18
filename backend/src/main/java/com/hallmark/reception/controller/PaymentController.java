package com.hallmark.reception.controller;

import com.hallmark.reception.dto.PaymentRequestDto;
import com.hallmark.reception.entity.Payment;
import com.hallmark.reception.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<List<Payment>> findAll() {
        return ResponseEntity.ok(paymentService.findAll());
    }

    @GetMapping("/guest/{guestId}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<List<Payment>> findByGuestId(@PathVariable Long guestId) {
        return ResponseEntity.ok(paymentService.findByGuestId(guestId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Payment> create(@Valid @RequestBody PaymentRequestDto request) {
        return new ResponseEntity<>(paymentService.create(request), HttpStatus.CREATED);
    }
}

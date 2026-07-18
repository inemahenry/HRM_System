package com.hallmark.reception.controller;

import com.hallmark.reception.entity.Receipt;
import com.hallmark.reception.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<List<Receipt>> findAll() {
        return ResponseEntity.ok(receiptService.findAll());
    }

    @GetMapping("/guest/{guestId}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<List<Receipt>> findByGuestId(@PathVariable Long guestId) {
        return ResponseEntity.ok(receiptService.findByGuestId(guestId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Receipt> findById(@PathVariable Long id) {
        return ResponseEntity.ok(receiptService.findById(id));
    }

    @GetMapping("/number/{receiptNumber}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Receipt> findByReceiptNumber(@PathVariable String receiptNumber) {
        return ResponseEntity.ok(receiptService.findByReceiptNumber(receiptNumber));
    }
}

package com.hallmark.reception.controller;

import com.hallmark.reception.dto.VillaRequestDto;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.service.VillaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/villas")
@RequiredArgsConstructor
public class VillaController {

    private final VillaService villaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<List<Villa>> findAll() {
        return ResponseEntity.ok(villaService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<Villa> findById(@PathVariable Long id) {
        return ResponseEntity.ok(villaService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<Villa> create(@Valid @RequestBody VillaRequestDto request) {
        return new ResponseEntity<>(villaService.create(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<Villa> update(@PathVariable Long id, @Valid @RequestBody VillaRequestDto request) {
        return ResponseEntity.ok(villaService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        villaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.VillaRequestDto;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.exception.ApiException;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.VillaRepository;
import com.hallmark.reception.service.VillaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VillaServiceImpl implements VillaService {

    private final VillaRepository villaRepository;

    @Override
    public List<Villa> findAll() {
        return villaRepository.findAll();
    }

    @Override
    public List<Villa> findAvailable() {
        return villaRepository.findAll().stream()
                .filter(Villa::isRentable)
                .filter(villa -> "VACANT".equalsIgnoreCase(villa.getStatus()))
                .toList();
    }

    @Override
    public List<Villa> search(String term) {
        String needle = term.toLowerCase();
        return villaRepository.findAll().stream()
                .filter(villa -> villa.getNumber() != null && villa.getNumber().toLowerCase().contains(needle)
                        || villa.getStatus() != null && villa.getStatus().toLowerCase().contains(needle)
                        || villa.getGuestName() != null && villa.getGuestName().toLowerCase().contains(needle))
                .toList();
    }

    @Override
    public List<Villa> findByStatus(String status) {
        return villaRepository.findAll().stream()
                .filter(villa -> status.equalsIgnoreCase(villa.getStatus()))
                .toList();
    }

    @Override
    public Villa findById(Long id) {
        return villaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Villa not found with id " + id));
    }

    @Override
    public Villa create(VillaRequestDto request) {
        if (villaRepository.findByNumber(request.getNumber()).isPresent()) {
            throw new ApiException("Villa number already exists");
        }

        Villa villa = Villa.builder()
                .number(request.getNumber())
                .status(request.getStatus() != null ? request.getStatus() : "VACANT")
                .active(true)
                .rentable(!"14".equals(request.getNumber()))
                .guestId(request.getGuestId())
                .guestName(request.getGuestName())
                .checkOutDate(request.getCheckOutDate())
                .type(request.getType())
                .notes(request.getNotes())
                .build();
        return villaRepository.save(villa);
    }

    @Override
    public Villa update(Long id, VillaRequestDto request) {
        Villa villa = findById(id);
        villa.setNumber(request.getNumber());
        villa.setStatus(request.getStatus() != null ? request.getStatus() : villa.getStatus());
        villa.setGuestId(request.getGuestId());
        villa.setGuestName(request.getGuestName());
        villa.setCheckOutDate(request.getCheckOutDate());
        villa.setType(request.getType());
        villa.setNotes(request.getNotes());
        return villaRepository.save(villa);
    }

    @Override
    public Villa markCleaning(Long id) {
        Villa villa = findById(id);
        villa.setStatus("CLEANING");
        return villaRepository.save(villa);
    }

    @Override
    public Villa markVacant(Long id) {
        Villa villa = findById(id);
        villa.setStatus("VACANT");
        villa.setGuestId(null);
        villa.setGuestName(null);
        villa.setPrimaryTenantName(null);
        villa.setPrimaryTenantId(null);
        villa.setCheckOutDate(null);
        return villaRepository.save(villa);
    }

    @Override
    public void delete(Long id) {
        Villa villa = findById(id);
        villaRepository.delete(villa);
    }
}

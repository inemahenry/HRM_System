package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.VillaRequestDto;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.exception.ApiException;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.VillaRepository;
import com.hallmark.reception.service.VillaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VillaServiceImpl implements VillaService {

    private final VillaRepository villaRepository;

    @Override
    public List<Villa> findAll() {
        return villaRepository.findAll().stream()
                .filter(this::isReceptionVilla)
                .sorted(Comparator.comparingInt(villa -> Integer.parseInt(villa.getNumber())))
                .toList();
    }

    @Override
    public List<Villa> findAvailable() {
        return findAll().stream()
                .filter(villa -> "VACANT".equalsIgnoreCase(villa.getStatus()))
                .toList();
    }

    @Override
    public List<Villa> search(String term) {
        String needle = term.toLowerCase();
        return findAll().stream()
                .filter(villa -> villa.getNumber() != null && villa.getNumber().toLowerCase().contains(needle)
                        || villa.getStatus() != null && villa.getStatus().toLowerCase().contains(needle)
                        || villa.getGuestName() != null && villa.getGuestName().toLowerCase().contains(needle))
                .toList();
    }

    @Override
    public List<Villa> findByStatus(String status) {
        return findAll().stream()
                .filter(villa -> status.equalsIgnoreCase(villa.getStatus()))
                .toList();
    }

    @Override
    public Villa findById(Long id) {
        Villa villa = villaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Villa not found with id " + id));
        if (!isReceptionVilla(villa)) {
            throw new ResourceNotFoundException("Villa not found with id " + id);
        }
        return villa;
    }

    @Override
    public Villa create(VillaRequestDto request) {
        throw new ApiException("Hallmark has a fixed inventory of 30 villas. Edit an existing villa instead.");
    }

    @Override
    public Villa update(Long id, VillaRequestDto request) {
        Villa villa = findById(id);
        villa.setStatus(request.getStatus() != null ? request.getStatus() : villa.getStatus());
        villa.setGuestId(request.getGuestId());
        villa.setGuestName(request.getGuestName());
        villa.setCheckOutDate(request.getCheckOutDate());
        villa.setType(request.getType());
        villa.setOccupancy(request.getOccupancy() != null ? request.getOccupancy() : villa.getOccupancy());
        villa.setRentStatus(request.getRentStatus() != null ? request.getRentStatus() : villa.getRentStatus());
        villa.setCleaningPaymentStatus(request.getCleaningPaymentStatus() != null ? request.getCleaningPaymentStatus() : villa.getCleaningPaymentStatus());
        villa.setCleaningDay(request.getCleaningDay());
        villa.setAssignedCleaners(request.getAssignedCleaners());
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
        if (!villa.isRentable()) {
            throw new ApiException("Villa 14 is reserved for housekeepers and cannot be rented.");
        }
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
        throw new ApiException("Hallmark's 30 villa records are fixed and cannot be deleted.");
    }

    private boolean isReceptionVilla(Villa villa) {
        return villa.isRentable() && isHallmarkVilla(villa.getNumber());
    }

    private boolean isHallmarkVilla(String number) {
        try {
            int villaNumber = Integer.parseInt(number);
            return villaNumber >= 1 && villaNumber <= 30 && villaNumber != 14;
        } catch (NumberFormatException exception) {
            return false;
        }
    }
}

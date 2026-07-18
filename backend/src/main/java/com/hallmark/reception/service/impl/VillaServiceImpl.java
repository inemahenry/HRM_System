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
                .status(request.getStatus())
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
        villa.setStatus(request.getStatus());
        villa.setGuestId(request.getGuestId());
        villa.setGuestName(request.getGuestName());
        villa.setCheckOutDate(request.getCheckOutDate());
        villa.setType(request.getType());
        villa.setNotes(request.getNotes());
        return villaRepository.save(villa);
    }

    @Override
    public void delete(Long id) {
        Villa villa = findById(id);
        villaRepository.delete(villa);
    }
}

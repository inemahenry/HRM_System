package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.GuestRequestDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.service.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuestServiceImpl implements GuestService {

    private final GuestRepository guestRepository;

    @Override
    public List<Guest> findAll() {
        return guestRepository.findAll();
    }

    @Override
    public Guest findById(Long id) {
        return guestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id " + id));
    }

    @Override
    public Guest create(GuestRequestDto request) {
        Guest guest = Guest.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .idNumber(request.getIdNumber())
                .nationality(request.getNationality())
                .email(request.getEmail())
                .stayStatus(request.getStayStatus())
                .paymentStatus(request.getPaymentStatus())
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .totalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO)
                .amountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : BigDecimal.ZERO)
                .remainingBalance(request.getRemainingBalance() != null ? request.getRemainingBalance() : BigDecimal.ZERO)
                .villaId(request.getVillaId())
                .villaNumber(request.getVillaNumber())
                .notes(request.getNotes())
                .build();
        return guestRepository.save(guest);
    }

    @Override
    public Guest update(Long id, GuestRequestDto request) {
        Guest guest = findById(id);
        guest.setFullName(request.getFullName());
        guest.setPhoneNumber(request.getPhoneNumber());
        guest.setIdNumber(request.getIdNumber());
        guest.setNationality(request.getNationality());
        guest.setEmail(request.getEmail());
        guest.setStayStatus(request.getStayStatus());
        guest.setPaymentStatus(request.getPaymentStatus());
        guest.setCheckInDate(request.getCheckInDate());
        guest.setCheckOutDate(request.getCheckOutDate());
        guest.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : guest.getTotalAmount());
        guest.setAmountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : guest.getAmountPaid());
        guest.setRemainingBalance(request.getRemainingBalance() != null ? request.getRemainingBalance() : guest.getRemainingBalance());
        guest.setVillaId(request.getVillaId());
        guest.setVillaNumber(request.getVillaNumber());
        guest.setNotes(request.getNotes());
        return guestRepository.save(guest);
    }

    @Override
    public void delete(Long id) {
        Guest guest = findById(id);
        guestRepository.delete(guest);
    }
}

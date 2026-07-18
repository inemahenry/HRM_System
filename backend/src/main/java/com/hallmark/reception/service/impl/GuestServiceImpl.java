package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.GuestRequestDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.VillaRepository;
import com.hallmark.reception.service.GuestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuestServiceImpl implements GuestService {

    private final GuestRepository guestRepository;
    private final VillaRepository villaRepository;

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
                .stayStatus(request.getStayStatus() != null ? request.getStayStatus() : "Staying")
                .paymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : "Pending")
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .totalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : BigDecimal.ZERO)
                .amountPaid(request.getAmountPaid() != null ? request.getAmountPaid() : BigDecimal.ZERO)
                .remainingBalance(request.getRemainingBalance() != null ? request.getRemainingBalance() : BigDecimal.ZERO)
                .villaId(request.getVillaId())
                .villaNumber(request.getVillaNumber())
                .notes(request.getNotes())
                .build();

        Guest saved = guestRepository.save(guest);
        applyVillaAssignment(saved, true);
        return guestRepository.save(saved);
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
        Guest saved = guestRepository.save(guest);
        applyVillaAssignment(saved, false);
        return saved;
    }

    @Override
    public Guest checkIn(Long id, GuestRequestDto request) {
        Guest guest = findById(id);
        if (request != null) {
            if (request.getFullName() != null) {
                guest.setFullName(request.getFullName());
            }
            if (request.getPhoneNumber() != null) {
                guest.setPhoneNumber(request.getPhoneNumber());
            }
            if (request.getIdNumber() != null) {
                guest.setIdNumber(request.getIdNumber());
            }
            if (request.getNationality() != null) {
                guest.setNationality(request.getNationality());
            }
            if (request.getEmail() != null) {
                guest.setEmail(request.getEmail());
            }
            if (request.getPaymentStatus() != null) {
                guest.setPaymentStatus(request.getPaymentStatus());
            }
            if (request.getVillaId() != null) {
                guest.setVillaId(request.getVillaId());
            }
            if (request.getVillaNumber() != null) {
                guest.setVillaNumber(request.getVillaNumber());
            }
            if (request.getNotes() != null) {
                guest.setNotes(request.getNotes());
            }
        }

        guest.setStayStatus("Staying");
        guest.setCheckInDate(guest.getCheckInDate() != null ? guest.getCheckInDate() : LocalDate.now());
        guest.setCheckOutDate(null);
        if (guest.getPaymentStatus() == null || guest.getPaymentStatus().isBlank()) {
            guest.setPaymentStatus("Pending");
        }
        Guest saved = guestRepository.save(guest);
        applyVillaAssignment(saved, true);
        return saved;
    }

    @Override
    public Guest checkOut(Long id) {
        Guest guest = findById(id);
        guest.setStayStatus("Checked Out");
        guest.setCheckOutDate(guest.getCheckOutDate() != null ? guest.getCheckOutDate() : LocalDate.now());
        if (guest.getRemainingBalance() != null && guest.getRemainingBalance().compareTo(BigDecimal.ZERO) > 0) {
            guest.setPaymentStatus("Pending");
        } else {
            guest.setPaymentStatus("Paid");
        }

        Guest saved = guestRepository.save(guest);
        updateVillaForCheckout(saved);
        return saved;
    }

    @Override
    public void delete(Long id) {
        Guest guest = findById(id);
        guestRepository.delete(guest);
    }

    private void applyVillaAssignment(Guest guest, boolean checkIn) {
        if (guest.getVillaId() == null) {
            return;
        }

        Villa villa = villaRepository.findById(guest.getVillaId()).orElse(null);
        if (villa == null) {
            return;
        }

        villa.setGuestId(guest.getId());
        villa.setGuestName(guest.getFullName());
        villa.setCheckOutDate(null);
        villa.setActive(true);
        if (checkIn) {
            villa.setStatus("OCCUPIED");
            if (villa.getPrimaryTenantName() == null || villa.getPrimaryTenantName().isBlank()) {
                villa.setPrimaryTenantName(guest.getFullName());
                villa.setPrimaryTenantId(guest.getId());
            }
        }
        villaRepository.save(villa);
    }

    private void updateVillaForCheckout(Guest guest) {
        if (guest.getVillaId() == null) {
            return;
        }

        Villa villa = villaRepository.findById(guest.getVillaId()).orElse(null);
        if (villa == null) {
            return;
        }

        List<Guest> otherGuests = guestRepository.findAll().stream()
                .filter(candidate -> candidate.getVillaId() != null && candidate.getVillaId().equals(guest.getVillaId()))
                .filter(candidate -> !"Checked Out".equalsIgnoreCase(candidate.getStayStatus()))
                .toList();

        if (otherGuests.isEmpty()) {
            villa.setStatus("CLEANING");
            villa.setGuestId(null);
            villa.setGuestName(null);
            villa.setCheckOutDate(LocalDate.now().toString());
        } else {
            villa.setStatus("OCCUPIED");
        }

        villaRepository.save(villa);
    }
}
